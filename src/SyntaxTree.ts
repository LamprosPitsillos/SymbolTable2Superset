export type Types = {
    Inherit: Number,
    Friend: Number,
    NestedClass: Number,
    ClassField: Number,
    ClassTemplateParent: Number,
    ClassTemplateArg: Number,
    MethodReturn: Number,
    MethodArg: Number,
    MethodDefinition: Number,
    MemberExpr: Number,
    MethodTemplateArgs: Number,
}
export type Dependency = {
    from: String,
    to: String,
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
    full_type: String;
    name: String;
    src_info: SrcInfo;
    type: String;
}
export type Definition = {
    full_type: String;
    name: String;
    src_info: SrcInfo;
    type: String;
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
export type SymbolTreeJson = {
    dependencies: Dependency[];
    sources: String[];
    structures: Record<string, StructureEntry>;

}
