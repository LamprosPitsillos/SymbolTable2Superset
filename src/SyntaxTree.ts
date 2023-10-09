export type Types = {
    ClassField: number,
    ClassTemplateArg: number,
    ClassTemplateParent: number,
    Friend: number,
    Inherit: number,
    MemberExpr: number,
    MethodArg: number,
    MethodDefinition: number,
    MethodReturn: number,
    MethodTemplateArgs: number,
    NestedClass: number,
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
export type Field_flat = {
    field_access: string;
    field_col: number;
    field_file: string;
    field_full_name: string;
    field_full_type: string;
    field_line: number;
    field_name: string;
    field_type: string;
};

export type StructureEntry = {
    bases: string[] | null;
    contains: string[] | null;
    fields: Record<string, Field> | null;
    friends: string[] | null;
    methods: Record<string, Method> | null;
    name: string;
    namespace: string;
    nested_parent: string | null;
    src_info: SrcInfo;
    structure_type: string;
    template_args: string[] | null;
    template_parent: string | null;
};
export type StructureEntry_flat = {
    structure_bases: string[] | null;
    structure_contains: string[] | null;
    structure_fields: Record<string, Field> | null;
    structure_friends: string[] | null;
    structure_methods: Record<string, Method> | null;
    structure_name: string;
    structure_namespace: string;
    structure_nested_parent: string | null;
    structure_src_info: SrcInfo;
    structure_type: string;
    structure_template_args: string[] | null;
    structure_template_parent: string | null;
};

export type Arg = {
    name: string;
    full_type: string;
    src_info: SrcInfo;
    type: string;
}
export type Arg_flat = {
    arg_col: number;
    arg_file: string;
    arg_full_type: string;
    arg_line: number;
    arg_name: string;
    arg_type: string;
}
export type Definition = {
    definition_name: string;
    full_type: string;
    src_info: SrcInfo;
    type: string;
}
export type Definition_flat = {
    definition_col: number;
    definition_name: string;
    definition_file: string;
    definition_full_type: string;
    definition_line: number;
    definition_type: string;
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
    signature: string;
    src_info: SrcInfo;
    statements: number;
    template_args: string[] | null;
    virtual: boolean;
};

export type Method_flat = {
    method_access: string;
    method_args: Record<string, Arg> | null;
    method_branches: number;
    method_col: number;
    method_definitions: Record<string, Definition> | null;
    method_file: string;
    method_line: number;
    method_lines: number;
    method_literals: number;
    method_loops: number;
    method_max_scope: number;
    method_type: string;
    method_name: string;
    method_ret_type: string;
    method_statements: number;
    method_template_args: string[] | null;
    method_virtual: boolean;
};
export type Source = string;
export type Structures = Record<string, StructureEntry>;


export type SymbolTreeJson = {
    dependencies: Dependency[];
    sources: Source[];
    structures: Structures;

}

