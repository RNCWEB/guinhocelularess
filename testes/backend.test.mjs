// RNCWEB
import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "../backend/worker.mjs";
const db=new DatabaseSync(":memory:");
db.exec("PRAGMA foreign_keys=ON");
for(const file of ["0001_catalogo.sql","0002_demonstracao.sql"])db.exec(readFileSync(new URL("../migrations/"+file,import.meta.url),"utf8"));
const env={DB:{prepare(sql){let params=[];const st=db.prepare(sql);return {bind(...p){params=p;return this},async first(){return st.get(...params)??null},async all(){return {results:st.all(...params)}}}},async batch(stmts){return Promise.all(stmts.map(s=>s.all()))}},ASSETS:{fetch:()=>new Response("static")}};
const req=(p,method="GET")=>worker.fetch(new Request("https://teste.invalid"+p,{method}),env);
test("schema e dados iniciais",()=>{assert.equal(db.prepare("SELECT count(*) AS n FROM produtos").get().n,27);assert.equal(db.prepare("SELECT count(*) AS n FROM categorias").get().n,9);assert.throws(()=>db.exec("UPDATE produtos SET estoque=-1"));assert.throws(()=>db.exec("UPDATE produtos SET categoria='inexistente'"));});
test("catálogo público preserva o formato da loja",async()=>{const r=await req("/api/catalogo");assert.equal(r.status,200);const d=await r.json();assert.equal(d.categorias.length,9);assert.ok(d.produtos.length>0);assert.ok(d.produtos.every(p=>p.ativo===true && typeof p.especificacoes==="object"));});
test("consulta por ID e rotas inválidas",async()=>{assert.equal((await req("/api/produtos/tela-iphone11")).status,200);assert.equal((await req("/api/produtos/nao-existe")).status,404);assert.equal((await req("/api/nao-existe")).status,404);});
test("escrita pública bloqueada e arquivos encaminhados",async()=>{assert.equal((await req("/api/produtos","POST")).status,405);assert.equal(await (await req("/")).text(),"static");assert.equal((await req("/api/saude")).status,200);});
