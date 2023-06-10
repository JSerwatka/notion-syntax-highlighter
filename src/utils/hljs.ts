import hljs from 'highlight.js/lib/core';

import javascript from 'highlight.js/lib/languages/javascript';
// TODO: abap no support
// TODO: agda no support
import arduino from 'highlight.js/lib/languages/arduino';
import assembly from 'highlight.js/lib/languages/avrasm';
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
// TODO: dhall no support
import diff from 'highlight.js/lib/languages/diff';
import docker from 'highlight.js/lib/languages/dockerfile';
import ebnf from 'highlight.js/lib/languages/ebnf';
import elixir from 'highlight.js/lib/languages/elixir';
import elm from 'highlight.js/lib/languages/elm';
import erlang from 'highlight.js/lib/languages/erlang';
import fsharp from 'highlight.js/lib/languages/fsharp';
// TODO: flow no support
import fortran from 'highlight.js/lib/languages/fortran';
import gherkin from 'highlight.js/lib/languages/gherkin';
import glsl from 'highlight.js/lib/languages/glsl';
import go from 'highlight.js/lib/languages/go';
import graphql from 'highlight.js/lib/languages/graphql';
import groovy from 'highlight.js/lib/languages/groovy';
import haskell from 'highlight.js/lib/languages/haskell';
// TODO: idris no support
import java from 'highlight.js/lib/languages/java';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import kotlin from 'highlight.js/lib/languages/kotlin';
import latex from 'highlight.js/lib/languages/latex';
import less from 'highlight.js/lib/languages/less';
import lisp from 'highlight.js/lib/languages/lisp';
import livescript from 'highlight.js/lib/languages/livescript';
import llvm from 'highlight.js/lib/languages/llvm';
import lua from 'highlight.js/lib/languages/lua';
import makefile from 'highlight.js/lib/languages/makefile';
import markdown from 'highlight.js/lib/languages/markdown';
import matlab from 'highlight.js/lib/languages/matlab';
import mathematica from 'highlight.js/lib/languages/mathematica';
// TODO: mermaid no support
import nix from 'highlight.js/lib/languages/nix';
import objectivec from 'highlight.js/lib/languages/objectivec';
import ocaml from 'highlight.js/lib/languages/ocaml';
import delphi from 'highlight.js/lib/languages/delphi';
import perl from 'highlight.js/lib/languages/perl';
import php from 'highlight.js/lib/languages/php';
import powershell from 'highlight.js/lib/languages/powershell';
import prolog from 'highlight.js/lib/languages/prolog';
import protobuf from 'highlight.js/lib/languages/protobuf';
// TODO: purescript no support
import python from 'highlight.js/lib/languages/python';
import r from 'highlight.js/lib/languages/r';
// TODO: racket no support
import reasonml from 'highlight.js/lib/languages/reasonml'; //TODO
import ruby from 'highlight.js/lib/languages/ruby';
import rust from 'highlight.js/lib/languages/rust';
// TODO: sass no support
import scss from 'highlight.js/lib/languages/scss';
import scala from 'highlight.js/lib/languages/scala';
import scheme from 'highlight.js/lib/languages/scheme';
import { solidity } from 'highlightjs-solidity'; // soliditiy needs to use an external package - https://www.npmjs.com/package/highlightjs-solidity
import sql from 'highlight.js/lib/languages/sql';
import swift from 'highlight.js/lib/languages/swift';
import ini from 'highlight.js/lib/languages/ini';
import typescript from 'highlight.js/lib/languages/typescript';
import vbnet from 'highlight.js/lib/languages/vbnet';
import verilog from 'highlight.js/lib/languages/verilog';
import vhdl from 'highlight.js/lib/languages/vhdl';
import wasm from 'highlight.js/lib/languages/wasm';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

// Add aliases used by Notion
hljs.registerAliases(['visual-basic'], { languageName: 'vbnet' });
hljs.registerAliases(['reason'], { languageName: 'reasonml' });
hljs.registerAliases(['markdown', 'markup'], { languageName: 'markdown' });
hljs.registerAliases(['assembly', 'nasm'], { languageName: 'assembly' });

// Register all languages supported by Notion
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('arduino', arduino);
hljs.registerLanguage('assembly', assembly);
hljs.registerLanguage('bash', bash); // notion returns "bash" for both shell and bash
hljs.registerLanguage('basic', basic);
hljs.registerLanguage('bnf', bnf);
hljs.registerLanguage('c', c);
hljs.registerLanguage('csharp', csharp);
hljs.registerLanguage('cpp', cpp);
hljs.registerLanguage('clojure', clojure);
hljs.registerLanguage('coffeescript', coffeescript);
hljs.registerLanguage('coq', coq);
hljs.registerLanguage('css', css);
hljs.registerLanguage('dart', dart);
hljs.registerLanguage('diff', diff);
hljs.registerLanguage('docker', docker);
hljs.registerLanguage('ebnf', ebnf);
hljs.registerLanguage('elixir', elixir);
hljs.registerLanguage('elm', elm);
hljs.registerLanguage('erlang', erlang);
hljs.registerLanguage('fsharp', fsharp);
hljs.registerLanguage('fortran', fortran);
hljs.registerLanguage('gherkin', gherkin);
hljs.registerLanguage('glsl', glsl);
hljs.registerLanguage('go', go);
hljs.registerLanguage('graphql', graphql);
hljs.registerLanguage('groovy', groovy);
hljs.registerLanguage('haskell', haskell);
hljs.registerLanguage('java', java);
hljs.registerLanguage('json', json);
hljs.registerLanguage('julia', julia);
hljs.registerLanguage('kotlin', kotlin);
hljs.registerLanguage('latex', latex);
hljs.registerLanguage('less', less);
hljs.registerLanguage('lisp', lisp);
hljs.registerLanguage('livescript', livescript);
hljs.registerLanguage('llvm', llvm);
hljs.registerLanguage('lua', lua);
hljs.registerLanguage('makefile', makefile);
hljs.registerLanguage('markdown', markdown); // notion has both 'markup' and 'markdown' - use markdown for both of them - alias extension above
hljs.registerLanguage('matlab', matlab);
hljs.registerLanguage('mathematica', mathematica);
hljs.registerLanguage('nix', nix);
hljs.registerLanguage('objectivec', objectivec);
hljs.registerLanguage('ocaml', ocaml);
hljs.registerLanguage('delphi', delphi);
hljs.registerLanguage('perl', perl);
hljs.registerLanguage('php', php);
hljs.registerLanguage('powershell', powershell);
hljs.registerLanguage('prolog', prolog);
hljs.registerLanguage('protobuf', protobuf);
hljs.registerLanguage('python', python);
hljs.registerLanguage('r', r);
hljs.registerLanguage('reasonml', reasonml); // notion returns "reason" which originally is not supported by this package - alias extension above
hljs.registerLanguage('ruby', ruby);
hljs.registerLanguage('rust', rust);
hljs.registerLanguage('scss', scss);
hljs.registerLanguage('scala', scala);
hljs.registerLanguage('scheme', scheme);
hljs.registerLanguage('solidity', solidity);
hljs.registerLanguage('sql', sql);
hljs.registerLanguage('swift', swift);
hljs.registerLanguage('ini', ini); // notion returns "toml" for toml, highlight.js uses init package for that, check https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
hljs.registerLanguage('typescript', typescript);
hljs.registerLanguage('vbnet', vbnet); // notion return "visual-basic", no support for pure vb in highlightjs - apparently vbnet has the most similar syntax - alias extension above
hljs.registerLanguage('verilog', verilog);
hljs.registerLanguage('vhdl', vhdl);
hljs.registerLanguage('wasm', wasm);
hljs.registerLanguage('xml', xml); // supports also "html", check https://github.com/highlightjs/highlight.js/blob/main/SUPPORTED_LANGUAGES.md
hljs.registerLanguage('yaml', yaml);

export default hljs;

// How to change all imports to create all register functions:
// Find: import\s(.*)(?= from).*
// Replace: hljs.registerLanguage('$1', $1)
