export type Types = {
    Inherit: number,
    Friend: number,
    NestedClass: number,
    ClassField: number,
    ClassTemplateParent: number,
    ClassTemplateArg: number,
    MethodReturn: number,
    MethodArg: number,
    MethodDefinition: number,
    MemberExpr: number,
    MethodTemplateArgs: number,
}
export type Dependency = {
    from: string,
    to: string,
    types: Types

}
export type SrcInfo = {
    col: number;
    file: string;
    line: number;
};

export type Field = {
    access: string;
    full_type: string;
    name: string;
    src_info: SrcInfo;
    type: string;
};

export type StructureEntry = {
    bases: string[] | null;
    contains: string[] | null;
    fields: Record<string, Field> | null;
    friends: string[] | null;
    methods: string[] | null;
    name: string;
    namespace: string;
    nested_parent: string | null;
    src_info: SrcInfo;
    structure_type: string;
    template_args: string[] | null;
    template_parent: string | null;
};

export type Arg = {
    full_type: string;
    name: string;
    src_info: SrcInfo;
    type: string;
}
export type Definition = {
    full_type: string;
    name: string;
    src_info: SrcInfo;
    type: string;
}
export type Method = {
    access: string;
    args: Record<string, Arg> | null;
    branches: number;
    definitions: Record<string, Definition> | null; 
    lines: number;
    literals: number;
    loops: number;
    max_scope: number;
    method_type: string;
    name: string;
    ret_type: string;
    src_info: SrcInfo;
    statements: number;
    template_args: string[] | null;
    virtual: boolean;
};

export type Source = string;
export type Structures = Record<string, StructureEntry>;


export type SymbolTreeJson = {
    dependencies: Dependency[];
    sources: Source[];
    structures: Structures;

}

