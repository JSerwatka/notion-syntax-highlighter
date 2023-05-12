import hljs from 'highlight.js/lib/core';
// All languages supported by Notion
import javascript from 'highlight.js/lib/languages/javascript';
// TODO: abap no suport
// TODO: agda no suport
import arduino from 'highlight.js/lib/languages/arduino';
import assembly from 'highlight.js/lib/languages/armasm';
import bash from 'highlight.js/lib/languages/bash';
import basic from 'highlight.js/lib/languages/basic';
import bnf from 'highlight.js/lib/languages/bnf';
import c from 'highlight.js/lib/languages/c';
import csharp from 'highlight.js/lib/languages/csharp';
import cpp from 'highlight.js/lib/languages/cpp';
import clojure from 'highlight.js/lib/languages/clojure';
import coffeescript from 'highlight.js/lib/languages/coffeescript';
import coq from 'highlight.js/lib/languages/coq';
import css from 'highlight.js/lib/languages/css';
import dart from 'highlight.js/lib/languages/dart';
// TODO: dhall no suport
import diff from 'highlight.js/lib/languages/diff';
import docker from 'highlight.js/lib/languages/dockerfile';
import ebnf from 'highlight.js/lib/languages/ebnf';
import elixir from 'highlight.js/lib/languages/elixir';
import elm from 'highlight.js/lib/languages/elm';
import erlang from 'highlight.js/lib/languages/erlang';
import fsharp from 'highlight.js/lib/languages/fsharp';
// TODO: flow no suport
import fortran from 'highlight.js/lib/languages/fortran';
import gherkin from 'highlight.js/lib/languages/gherkin';
import glsl from 'highlight.js/lib/languages/glsl';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import groovy from 'highlight.js/lib/languages/groovy';
import haskell from 'highlight.js/lib/languages/haskell';
// TODO: html no suport
// TODO: idris no suport
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import less from 'highlight.js/lib/languages/less';
import lisp from 'highlight.js/lib/languages/lisp';
import livescript from 'highlight.js/lib/languages/livescript';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
// TODO: markup no suport
// TODO: mermaid no suport
import nix from 'highlight.js/lib/languages/nix';
import objectivec from 'highlight.js/lib/languages/objectivec';
import ocaml from 'highlight.js/lib/languages/ocaml';
import perl from 'highlight.js/lib/languages/perl';
// TODO: pascal no suport
import php from 'highlight.js/lib/languages/php';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import prolog from 'highlight.js/lib/languages/prolog';
import protobuf from 'highlight.js/lib/languages/protobuf';
// TODO: purescript no suport
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
// TODO: racket no suport

hljs.registerLanguage('javascript', javascript);

export default hljs;
