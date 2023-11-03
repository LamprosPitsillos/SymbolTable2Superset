import assert from "assert";
import { SymbolTreeJson } from "../SyntaxTree";

import * as fs from 'fs';
import * as readline from 'readline';

// async function analyse(ST : SymbolTreeJson,max_line_len){
//         let incidents, report = [];
//          if (ST.headers) {
//                 for (const header of ST.headers) {
//                     incidents = await iterate_file(header, max_line_len);
//                     for (const incident of incidents) {
//                         report.push(incident);
//                     }
//                 }
//             }
//         for(const source of ST.sources){
//             incidents = await iterate_file(source, max_line_len);
//             for(const incident of incidents){
//                 report.push(incident);
//             }
//         }
//         return report;
//     }
//

type Line = {
    str: string,
    comment_open: boolean;
    real_len: number;
};

function un_commented_line_iter(line: Line) {

    let char = '';
    for (let char_idx = 0; char_idx < line.str.length; ++char_idx) {
        char = line.str[char_idx];
        switch (char) {
            case '/':
                if (!line.comment_open) {
                    const next = line.str[char_idx + 1];
                    switch (next) {
                        case '*':
                            line.comment_open = true;
                            char_idx += 1;  // Skip the '*' character
                            break;
                        case '/':
                            return;
                        default:
                            line.real_len += 1;
                    }
                }
                break;
            case '*':
                if (!line.comment_open) {
                    line.real_len += 1
                } else if (line.str[char_idx + 1] === '/') {
                    line.comment_open = false;
                    char_idx += 1;  // Skip the '/' character
                }
                break;
            default:
                if (!line.comment_open) {
                    line.real_len += 1;
                }
        }
    }

}
function un_commented_line_rec(line: Line, last_index: number = 0): Line {

    if (line.str.length === 0) {
        line.real_len = 0
        return line;
    }

    if (line.str.length === last_index) {
        return line;
    }


    if (line.comment_open) {
        let comment_close_idx = line.str.indexOf("*/", last_index);
        if (comment_close_idx === -1) return line;
        line.comment_open = false;
        return un_commented_line_rec(line, comment_close_idx + 2)
    }

    let line_comment_idx = line.str.indexOf("//", last_index);

    let comment_open_idx = line.str.indexOf("/*", last_index);
    if (comment_open_idx === -1) {
        line.real_len += (line_comment_idx === -1) ? (line.str.length - last_index) : (line_comment_idx - last_index);
        return line;
    }
    if (line_comment_idx !== -1 && line_comment_idx < comment_open_idx) {
        line.real_len += line_comment_idx - last_index;
        return line
    }

    line.real_len += comment_open_idx - last_index;
    line.comment_open = true;

    let comment_close_idx = line.str.indexOf("*/", last_index);
    if (comment_close_idx === -1) {
        return line;
    }
    line.comment_open = false;

    let ret = un_commented_line_rec(line, comment_close_idx + 2)
    return ret;
}

let cpp_lines = [
    [
        { str: 'hello "/* thehre */" baby /* jjj // ', len: 14 },
        { str: ' hlhflh /* jfjf /* // */ hello /* hhahah get fucked */', len: 7 }
    ],

    [{ str: 'void GraphGenerationSTVisitor::VisitStructure(Structure* s) {', len: 61 }],
    [{ str: 'hello /* thehre */ baby /* jjj // ', len: 12 }],
    [{ str: 'hello /* thehre */ baby /* jjj // */', len: 12 }],
    [{ str: 'hello /* thehre */ baby /* jjj // */ hahahha', len: 20 }],
    [{ str: 'hello /* thehre */ baby  jjj // ', len: 17 }],
    [{ str: 'hello /* thehre */ baby //   jjj  ', len: 12 }],
    [{ str: 'hello //  /* thehre */ baby //   jjj  ', len: 6 }],
    [{ str: 'hello /*  // thehre */ baby // jjj  ', len: 12 }],
    [{ str: 'hello // /*  // thehre */ baby // jjj  ', len: 6 }],


    [
        { str: 'int main() {', len: 12 },
        { str: '    // Single-line comment', len: 4 },
        { str: '    return 0;', len: 13 },
        { str: '}', len: 1 },
    ],
    [
        { str: '/* This is a', len: 0 },
        { str: '   multi-line comment */', len: 0 },
        { str: 'int x = 5;', len: 10 },
        { str: '/* Multi-line comment', len: 0 },
        { str: 'continued on the next line */', len: 0 },
    ],
    [
        { str: 'int x = 5;', len: 10 },
        { str: '/*', len: 0 },
        { str: 'int y = 10;', len: 0 },
        { str: '*/', len: 0 },
        { str: 'int z = 15;', len: 11 },
    ],
    [
        { str: 'int x = 5;', len: 10 },
        { str: '// Comment inside /*', len: 0 },
        { str: 'int y = 10;', len: 11 },
        { str: 'int z = 15;', len: 11 },
    ],
    [
        { str: 'int a = 5;', len: 10 },
        { str: '/* Multi-line', len: 0 },
        { str: 'comment', len: 0 },
        { str: 'in the middle */', len: 0 },
        { str: 'int b = 10;', len: 11 },
    ],
    [
        { str: 'int a = 5;', len: 10 },
        { str: '/* Nested /* comment */', len: 0 },
        { str: 'int b = 10;', len: 11 },
    ],
    [
        { str: 'int a = 5;', len: 10 },
        { str: '/* Nested // comment */', len: 0 },
        { str: 'int b = 10;', len: 11 },
    ],
    [
        { str: 'int x = 5;', len: 10 },
        { str: '/* Multi-line comment', len: 0 },
        { str: 'continued on the next line', len: 0 },
        { str: 'with nested /* comment */', len: 0 },
        { str: 'int y = 10;', len: 11 },
    ],
    [{ str: '/* Comment starting in the middle', len: 0 },
    { str: 'of a line */', len: 0 },
    { str: 'int x = 5;', len: 10 },
    { str: '/* Comment', len: 0 },
    { str: 'continued', len: 0 },
    { str: 'on multiple lines */', len: 0 },
    { str: 'int y = 10;', len: 11 }],


    [
        { str: `#include "GraphGeneration.h"`, len: 28 },
        { str: `#include <cassert>`, len: 18 },
        { str: ``, len: 0 },
        { str: `using namespace dependenciesMining;`, len: 35 },
        { str: `using namespace graph;`, len: 22 },
        { str: `using namespace graphGeneration;`, len: 32 },
        { str: ``, len: 0 },
        { str: `// FIXME Dependencies cardinalities`, len: 0 },
        { str: ``, len: 0 },
        { str: `// GraphGenerationSTVisitor`, len: 0 },
        { str: ``, len: 0 },
        { str: `void GraphGenerationSTVisitor::VisitStructure(Structure* s) {`, len: 61 },
        { str: `	assert(s);`, len: 11 },
        { str: ``, len: 0 },
        { str: `	if (s->IsUndefined())`, len: 22 },
        { str: `		return;`, len: 9 },
        { str: ``, len: 0 },
        { str: `	if (graph.GetNode(s->GetID())) {`, len: 33 },
        { str: `		if (currNode && currNode->GetID() != s->GetID()) {			// Ignore the self dependencies `, len: 55 },
        { str: `			assert(currDepType != Undefined_dep_t);`, len: 42 },
        { str: `			currNode->AddEdge(graph.GetNode(s->GetID()), currDepType);`, len: 61 },
        { str: `		}`, len: 3 },
        { str: `		return;`, len: 9 },
        { str: `	}`, len: 2 },
        { str: ``, len: 0 },
        { str: `	Node* oldCurrNode = currNode;`, len: 30 },
        { str: `	Edge::DependencyType oldCurrDepType = currDepType;`, len: 51 },
        { str: `	currNode = new Node();`, len: 23 },
        { str: `	untyped::Object& nodeData = currNode->GetData();`, len: 49 },
        { str: ``, len: 0 },
        { str: `	// Symbol `, len: 1 },
        { str: `	nodeData.Set("id", s->GetID());`, len: 32 },
        { str: `	nodeData.Set("name", s->GetName());`, len: 36 },
        { str: `	nodeData.Set("namespace", s->GetNamespace());`, len: 46 },
        { str: ``, len: 0 },
        { str: `	untyped::Object srcInfo;`, len: 25 },
        { str: `	srcInfo.Set("fileName", s->GetSourceInfo().GetFileName());`, len: 59 },
        { str: `	srcInfo.Set("line", (double)s->GetSourceInfo().GetLine());`, len: 59 },
        { str: `	srcInfo.Set("column", (double)s->GetSourceInfo().GetColumn());`, len: 63 },
        { str: `	nodeData.Set("srcInfo", srcInfo);`, len: 34 },
        { str: ``, len: 0 },
        { str: `	nodeData.Set("classType", s->GetClassTypeAsString());`, len: 54 },
        { str: ``, len: 0 },
        { str: `	graph.AddNode(currNode);`, len: 25 },
        { str: ``, len: 0 },
        { str: `	// Structure`, len: 1 },
        { str: `	nodeData.Set("structureType", s->GetStructureTypeAsString());`, len: 62 },
        { str: ``, len: 0 },
        { str: `	if (s->GetTemplateParent()) {`, len: 30 },
        { str: `		auto* templateParent = s->GetTemplateParent();`, len: 48 },
        { str: `		if (!templateParent->IsUndefined()) {`, len: 39 },
        { str: `			currDepType = ClassTemplateParent_dep_t;`, len: 43 },
        { str: `			VisitStructure(static_cast<Structure*>(templateParent));`, len: 59 },
        { str: `			nodeData.Set("templateParent", templateParent->GetID());`, len: 59 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: ``, len: 0 },
        { str: `	if (s->GetNestedParent()) {`, len: 28 },
        { str: `		auto* nestedParent = s->GetNestedParent();`, len: 44 },
        { str: `		if (!nestedParent->IsUndefined()) {`, len: 37 },
        { str: `			currDepType = NestedClass_dep_t;`, len: 35 },
        { str: `			VisitStructure(static_cast<Structure*>(nestedParent));`, len: 57 },
        { str: `			nodeData.Set("nestedParent", nestedParent->GetID());`, len: 55 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: ``, len: 0 },
        { str: `	untyped::Object basesObj;`, len: 26 },
        { str: `	currDepType = Inherit_dep_t;`, len: 29 },
        { str: `	double index = 0;`, len: 18 },
        { str: `	for (auto& it : s->GetBases()) {`, len: 33 },
        { str: `		auto* base = it.second;`, len: 25 },
        { str: `		if (!((Structure*)base)->IsUndefined()) {`, len: 43 },
        { str: `			VisitStructure(static_cast<Structure*>(base));`, len: 49 },
        { str: `			basesObj.Set(index++, base->GetID());`, len: 40 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	nodeData.Set("bases", basesObj);`, len: 33 },
        { str: ``, len: 0 },
        { str: `	untyped::Object friendsObj;`, len: 28 },
        { str: `	index = 0;`, len: 11 },
        { str: `	currDepType = Friend_dep_t;`, len: 28 },
        { str: `	for (auto& it : s->GetFriends()) {`, len: 35 },
        { str: `		auto* friend_ = it.second;`, len: 28 },
        { str: `		if (!((Structure*)friend_)->IsUndefined()) {`, len: 46 },
        { str: `			VisitStructure(static_cast<Structure*>(friend_));`, len: 52 },
        { str: `			friendsObj.Set(index++, friend_->GetID());`, len: 45 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	nodeData.Set("friends", friendsObj);`, len: 37 },
        { str: ``, len: 0 },
        { str: `	untyped::Object templArgsObj;`, len: 30 },
        { str: `	index = 0;`, len: 11 },
        { str: `	currDepType = ClassTemplateArg_dep_t;`, len: 38 },
        { str: `	for (auto& it : s->GetTemplateArguments()) {`, len: 45 },
        { str: `		auto* templArg = it.second;`, len: 29 },
        { str: `		if (!((Structure*)templArg)->IsUndefined()) {`, len: 47 },
        { str: `			VisitStructure(static_cast<Structure*>(templArg));`, len: 53 },
        { str: `			templArgsObj.Set(index++, templArg->GetID());`, len: 48 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	nodeData.Set("templateArguments", templArgsObj);`, len: 49 },
        { str: ``, len: 0 },
        { str: `	untyped::Object fieldsObj;`, len: 27 },
        { str: `	currDepType = ClassField_dep_t;`, len: 32 },
        { str: `	for (auto& it : s->GetFields()) {`, len: 34 },
        { str: `		auto* field = it.second;`, len: 26 },
        { str: `		if (((Definition*)field)->isStructure()) {`, len: 44 },
        { str: `			if (!((Definition*)field)->GetType()->IsUndefined()) {`, len: 57 },
        { str: `				VisitDefinition(static_cast<Definition*>(field));`, len: 53 },
        { str: `				fieldsObj.Set(it.first, innerObj);`, len: 38 },
        { str: `			}`, len: 4 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	nodeData.Set("fields", fieldsObj);`, len: 35 },
        { str: ``, len: 0 },
        { str: `	untyped::Object methodsObj;`, len: 28 },
        { str: `	for (auto& it : s->GetMethods()) {`, len: 35 },
        { str: `		auto* method = it.second;`, len: 27 },
        { str: `		if (((Method*)method)->IsTrivial())						// Ignore the Trivial methods that compiler creates automatically`, len: 43 },
        { str: `			continue;`, len: 12 },
        { str: `		VisitMethod(static_cast<Method*>(method));`, len: 44 },
        { str: `		methodsObj.Set(it.first, innerObj);`, len: 37 },
        { str: `	}`, len: 2 },
        { str: `	nodeData.Set("methods", methodsObj);`, len: 37 },
        { str: ``, len: 0 },
        { str: `	if (oldCurrNode) {`, len: 19 },
        { str: `		assert(oldCurrDepType != Undefined_dep_t);`, len: 44 },
        { str: `		oldCurrNode->AddEdge(currNode, oldCurrDepType);`, len: 49 },
        { str: `	}`, len: 2 },
        { str: ``, len: 0 },
        { str: `	currNode = oldCurrNode;`, len: 24 },
        { str: `	currDepType = oldCurrDepType;`, len: 30 },
        { str: `}`, len: 1 },
        { str: ``, len: 0 },
        { str: ``, len: 0 },
        { str: `void GraphGenerationSTVisitor::VisitMethod(Method* s) {`, len: 55 },
        { str: `	assert(s);`, len: 11 },
        { str: ``, len: 0 },
        { str: `	Edge::DependencyType oldCurrDepType = currDepType;`, len: 51 },
        { str: `	untyped::Object data;`, len: 22 },
        { str: ``, len: 0 },
        { str: `	// Symbol `, len: 1 },
        { str: `	data.Set("id", s->GetID());`, len: 28 },
        { str: `	data.Set("name", s->GetName());`, len: 32 },
        { str: `	data.Set("namespace", s->GetNamespace());`, len: 42 },
        { str: ``, len: 0 },
        { str: `	untyped::Object srcInfo;`, len: 25 },
        { str: `	srcInfo.Set("fileName", s->GetSourceInfo().GetFileName());`, len: 59 },
        { str: `	srcInfo.Set("line", (double)s->GetSourceInfo().GetLine());`, len: 59 },
        { str: `	srcInfo.Set("column", (double)s->GetSourceInfo().GetColumn());`, len: 63 },
        { str: `	data.Set("srcInfo", srcInfo);`, len: 30 },
        { str: `	data.Set("classType", s->GetClassTypeAsString());`, len: 50 },
        { str: ``, len: 0 },
        { str: `	// Method`, len: 1 },
        { str: `	data.Set("methodType", s->GetMethodTypeAsString());`, len: 52 },
        { str: ``, len: 0 },
        { str: `	if (s->GetReturnType()) {`, len: 26 },
        { str: `		auto* returnType = s->GetReturnType();`, len: 40 },
        { str: `		if (!returnType->IsUndefined()) {`, len: 35 },
        { str: `			currDepType = MethodReturn_dep_t;`, len: 36 },
        { str: `			VisitStructure(static_cast<Structure*>(returnType));`, len: 55 },
        { str: `			data.Set("returnType", returnType->GetID());`, len: 47 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: ``, len: 0 },
        { str: `	untyped::Object argsObj;`, len: 25 },
        { str: `	currDepType = MethodArg_dep_t;`, len: 31 },
        { str: `	for (auto& it : s->GetArguments()) {`, len: 37 },
        { str: `		auto* arg = it.second;`, len: 24 },
        { str: `		if (((Definition*)arg)->isStructure()) {`, len: 42 },
        { str: `			if (!((Definition*)arg)->GetType()->IsUndefined()) {`, len: 55 },
        { str: `				VisitDefinition(static_cast<Definition*>(arg));`, len: 51 },
        { str: `				argsObj.Set(it.first, innerObj);`, len: 36 },
        { str: `			}`, len: 4 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	data.Set("arguments", argsObj);`, len: 32 },
        { str: ``, len: 0 },
        { str: `	untyped::Object defsObj;`, len: 25 },
        { str: `	currDepType = MethodDefinition_dep_t;`, len: 38 },
        { str: `	for (auto& it : s->GetDefinitions()) {`, len: 39 },
        { str: `		auto* def = it.second;`, len: 24 },
        { str: `		if (((Definition*)def)->isStructure()) {`, len: 42 },
        { str: `			if (!((Definition*)def)->GetType()->IsUndefined()) {`, len: 55 },
        { str: `				VisitDefinition(static_cast<Definition*>(def));`, len: 51 },
        { str: `				defsObj.Set(it.first, innerObj);`, len: 36 },
        { str: `			}`, len: 4 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	data.Set("definitions", defsObj);`, len: 34 },
        { str: ``, len: 0 },
        { str: `	untyped::Object templArgsObj;`, len: 30 },
        { str: `	double index = 0;`, len: 18 },
        { str: `	currDepType = MethodTemplateArg_dep_t;`, len: 39 },
        { str: `	for (auto& it : s->GetTemplateArguments()) {`, len: 45 },
        { str: `		auto* templArg = it.second;`, len: 29 },
        { str: `		if (!((Structure*)templArg)->IsUndefined()) {`, len: 47 },
        { str: `			VisitStructure(static_cast<Structure*>(templArg));`, len: 53 },
        { str: `			templArgsObj.Set(index++, templArg->GetID());`, len: 48 },
        { str: `		}`, len: 3 },
        { str: `	}`, len: 2 },
        { str: `	data.Set("templateArguments", templArgsObj);`, len: 45 },
        { str: ``, len: 0 },
        { str: `	// memberexpr`, len: 1 },
        { str: `	untyped::Object memberExprsObj;`, len: 32 },
        { str: `	currDepType = MemberExpr_dep_t;`, len: 32 },
        { str: `	for (auto it : s->GetMemberExpr()) {`, len: 37 },
        { str: `		auto expr = it.second;`, len: 24 },
        { str: `		untyped::Object memberExprObj;`, len: 32 },
        { str: ``, len: 0 },
        { str: `		if (!expr.GetMembers().size())`, len: 32 },
        { str: `			continue;`, len: 12 },
        { str: ``, len: 0 },
        { str: `		memberExprObj.Set("expr", expr.GetExpr());`, len: 44 },
        { str: `		untyped::Object srcInfo;`, len: 26 },
        { str: `		srcInfo.Set("fileName", expr.GetSourceInfo().GetFileName());`, len: 62 },
        { str: `		srcInfo.Set("line", (double)expr.GetSourceInfo().GetLine());`, len: 62 },
        { str: `		srcInfo.Set("column", (double)expr.GetSourceInfo().GetColumn());`, len: 66 },
        { str: `		memberExprObj.Set("srcInfo", srcInfo);`, len: 40 },
        { str: ``, len: 0 },
        { str: `		untyped::Object membersObj;`, len: 29 },
        { str: `		double index2 = 0;`, len: 20 },
        { str: `		for (auto it2 : expr.GetMembers()) {`, len: 38 },
        { str: `			auto member = it2;`, len: 21 },
        { str: `			auto* memberType = it2.GetType();`, len: 36 },
        { str: `			if (!memberType->IsUndefined()) {`, len: 36 },
        { str: `				untyped::Object memberObj;`, len: 30 },
        { str: ``, len: 0 },
        { str: `				memberObj.Set("name", member.GetName());`, len: 44 },
        { str: `				assert(it2.GetType());`, len: 26 },
        { str: `				memberObj.Set("type", memberType->GetID());`, len: 47 },
        { str: `				memberObj.Set("memberType", member.GetMemberType());`, len: 56 },
        { str: ``, len: 0 },
        { str: `				untyped::Object locEnd;`, len: 27 },
        { str: `				locEnd.Set("fileName", member.GetLocEnd().GetFileName());`, len: 61 },
        { str: `				locEnd.Set("line", (double)member.GetLocEnd().GetLine());`, len: 61 },
        { str: `				locEnd.Set("column", (double)member.GetLocEnd().GetColumn());`, len: 65 },
        { str: `				memberObj.Set("locEnd", locEnd);`, len: 36 },
        { str: ``, len: 0 },
        { str: `				VisitStructure(static_cast<Structure*>(memberType));`, len: 56 },
        { str: `				membersObj.Set(index2++, memberObj);`, len: 40 },
        { str: `			}`, len: 4 },
        { str: `			memberExprObj.Set("members", membersObj);`, len: 44 },
        { str: `		}`, len: 3 },
        { str: ``, len: 0 },
        { str: `		memberExprsObj.Set(it.first, memberExprObj);`, len: 46 },
        { str: `	}`, len: 2 },
        { str: `	data.Set("memberExprs", memberExprsObj);`, len: 41 },
        { str: ``, len: 0 },
        { str: `	innerObj.Clear();`, len: 18 },
        { str: `	innerObj = data;`, len: 17 },
        { str: `	data.Clear();`, len: 14 },
        { str: `	currDepType = oldCurrDepType;`, len: 30 },
        { str: `}`, len: 1 },
        { str: ``, len: 0 },
        { str: ``, len: 0 },
        { str: `void GraphGenerationSTVisitor::VisitDefinition(Definition* s) {`, len: 63 },
        { str: `	assert(s);`, len: 11 },
        { str: ``, len: 0 },
        { str: `	Edge::DependencyType oldCurrDepType = currDepType;`, len: 51 },
        { str: ``, len: 0 },
        { str: `	Structure* typeStruct = (Structure*)s->GetType();`, len: 50 },
        { str: `	assert(typeStruct);`, len: 20 },
        { str: ``, len: 0 },
        { str: `	if (typeStruct->IsUndefined())`, len: 31 },
        { str: `		assert(0);`, len: 12 },
        { str: ``, len: 0 },
        { str: `	VisitStructure(typeStruct);`, len: 28 },
        { str: `	Node* node = graph.GetNode(typeStruct->GetID());`, len: 49 },
        { str: ``, len: 0 },
        { str: `	untyped::Object data;`, len: 22 },
        { str: ``, len: 0 },
        { str: `	// Symbol `, len: 1 },
        { str: `	data.Set("id", s->GetID());`, len: 28 },
        { str: `	data.Set("name", s->GetName());`, len: 32 },
        { str: `	data.Set("namespace", s->GetNamespace());`, len: 42 },
        { str: ``, len: 0 },
        { str: `	untyped::Object srcInfo;`, len: 25 },
        { str: `	srcInfo.Set("fileName", s->GetSourceInfo().GetFileName());`, len: 59 },
        { str: `	srcInfo.Set("line", (double)s->GetSourceInfo().GetLine());`, len: 59 },
        { str: `	srcInfo.Set("column", (double)s->GetSourceInfo().GetColumn());`, len: 63 },
        { str: `	data.Set("srcInfo", srcInfo);`, len: 30 },
        { str: `	data.Set("classType", s->GetClassTypeAsString());`, len: 50 },
        { str: ``, len: 0 },
        { str: `	// Definition`, len: 1 },
        { str: `	data.Set("type", typeStruct->GetID());`, len: 39 },
        { str: ``, len: 0 },
        { str: `	innerObj.Clear();`, len: 18 },
        { str: `	innerObj = data;`, len: 17 },
        { str: `	data.Clear();`, len: 14 },
        { str: `	currDepType = oldCurrDepType;`, len: 30 },
        { str: `}`, len: 1 },
        { str: ``, len: 0 },
        { str: ``, len: 0 },
        { str: `Graph& GraphGenerationSTVisitor::GetGraph() {`, len: 45 },
        { str: `	return graph;`, len: 14 },
        { str: `}`, len: 1 },
        { str: ``, len: 0 },
        { str: ``, len: 0 },
        { str: `Graph graphGeneration::GenerateDependenciesGraph(const SymbolTable& st) {`, len: 73 },
        { str: `	GraphGenerationSTVisitor visitor;`, len: 34 },
        { str: `	st.Accept(&visitor);`, len: 21 },
        { str: `	return visitor.GetGraph();`, len: 27 },
        { str: `}`, len: 1 },

    ]

]

function test() {
    let passed = 0;
    let failed = 0;
    const failed_msg = `\x1b[31m${"=".repeat(30)}FAIL${"=".repeat(30)}\x1b[0m`;
    const pass_msg = `\x1b[32m${"=".repeat(30)}PASS${"=".repeat(30)}\x1b[0m`;
    function pass() {
        passed += 1;
        console.log(pass_msg);

    }
    function fail(expected: any) {
        failed += 1;
        console.log(`Expected value is ${expected}`);
        console.log(failed_msg);
    }
    for (const lines of cpp_lines) {

        const line_obj: Line = {
            str: "",
            comment_open: false,
            real_len: 0
        };

        for (const line of lines) {

            const str = line.str;
            const real_len_assert = line.len;

            line_obj.str = str;
            // un_commented_line_rec(line_obj)
            un_commented_line_iter(line_obj)
            console.log(line_obj)
            real_len_assert === line_obj.real_len ? pass() : fail(real_len_assert);
            line_obj.real_len = 0;
        }


    }

    console.log();
    console.log(`\x1b[32mPASSED: \x1b[1m${passed}\x1b[0m`);
    console.log(`\x1b[31mFAILED: \x1b[1m${failed}\x1b[0m`);
    console.log();
}

// test()

async function processFile(fileName: string) {
    const result = [];

    const fileStream = fs.createReadStream(fileName);
    const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity
    });

    let lineNumber = 1;

    const line_wrap: Line = {
        str: "",
        comment_open: false,
        real_len: 0
    };

    // if (!result[fileName]) {
    //     result[fileName] = [];
    // }
    for await (const line of rl) {
        line_wrap.str = line
        un_commented_line_iter(line_wrap); // You need to define your uncomment function


        result.push(line_wrap.real_len);
        line_wrap.real_len = 0;
        lineNumber++;
    }

    return result;
}

// processFile("/home/inferno/UoC/Ptixiaki/CodeAnalysisMeta/Code-Smell-Detector/GraphGenerator/GraphGeneration/GraphGeneration.cpp")
//     .then((result) => {
//         console.log(result);
//     })
//     .catch((error) => {
//         console.error(error);
//     });

