import { readFileSync, PathLike } from 'fs';


export async function getSmells(rule_file: PathLike) {
    try {
        const rules_file: string = readFileSync(rule_file, 'ascii');
        const rules = JSON.parse(rules_file);
        const validatedJSON = validateJSON(rules);
        return validatedJSON;

    } catch (error) {
        if (error instanceof Error) {
            console.log(error.message);
        }

    }

}

export function getRules(smells: SmellsJSON): Rule[] {
    const rules: Rule[] = [];

    for (const smell of smells.Smells) {
        for (const ruleName in smell.rules) {
            const rule = smell.rules[ruleName];

            if (rule.type === 'range') {
                const rangeRule = rule as RangeRule;
                rules.push({
                    name: ruleName,
                    min: rangeRule.value[0],
                    max: rangeRule.value[1],
                    enum: null,
                    bool: null
                });
            } else if (rule.type === 'enum') {
                const enumRule = rule as EnumRule;
                rules.push({
                    name: ruleName,
                    min: null,
                    max: null,
                    enum: enumRule.value,
                    bool: null
                });
            } else if (rule.type === 'boolean') {
                const booleanRule = rule as BooleanRule;
                rules.push({
                    name: ruleName,
                    min: null,
                    max: null,
                    enum: null,
                    bool: booleanRule.value
                });
            }
        }
    }

    return rules;
}

// getRules("./src/Rules.json").then(result=>console.log(result))

export type Rule = {
    name: string;
    min: number | null;
    max: number | null;
    // enum:NamingConvention;
    enum: string | null;
    bool: boolean | null;
}
export type Rule_db = {
    rule_name: string;
    rule_min: number | null;
    rule_max: number | null;
    // enum:NamingConvention;
    rule_enum: string | null;
    rule_bool: boolean | null;
}

type RangeRule = {
    formal_name: string;
    type: 'range';
    value: [number, number];
    valid: [number, number];
};

type EnumRule = {
    formal_name: string;
    type: 'enum';
    value: string;
    valid: string[];
};

type BooleanRule = {
    formal_name: string;
    type: 'boolean';
    value: boolean;
};

type RuleType = RangeRule | EnumRule | BooleanRule;

type Smell = {
    name: string;
    description: string;
    rules: {
        [key: string]: RuleType;
    };
};

type SmellsJSON = {
    Smells: Smell[];
};

function validateJSON(jsonData: any): SmellsJSON {
    if (typeof jsonData !== 'object' || jsonData === null || !Array.isArray(jsonData.Smells)) {
        throw new Error('Top-level JSON structure is invalid');
    }

    const validatedSmells: Smell[] = [];

    for (const rawSmell of jsonData.Smells) {
        if (typeof rawSmell !== 'object' || !('name' in rawSmell) || !('description' in rawSmell) || !('rules' in rawSmell)) {
            console.log(JSON.stringify(rawSmell));
            throw new Error('Invalid "Smell" object');
        }

        const rules: { [key: string]: RuleType } = {};

        if (rawSmell.rules === undefined /* || Object.keys(rawSmell.rules).length === 0 */) {
            throw new Error(`Invalid "Smell" object , no rule was given:

${JSON.stringify(rawSmell, null, 2)}

                `);
        }

        for (const key in rawSmell.rules) {
            const smellType = rawSmell.rules[key];
            if (isRangeRule(smellType)) {
                validateRangeRule(smellType);
            } else if (isEnumRule(smellType)) {
                validateEnumRule(smellType);
            } else if (isBooleanRule(smellType)) {
                validateBooleanRule(smellType);
            } else {
                throw new Error(`Invalid rule type for key: ${key}`);
            }

            rules[key] = smellType;
        }

        const validatedRule: Smell = {
            name: rawSmell.name,
            description: rawSmell.description,
            rules,
        };

        validatedSmells.push(validatedRule);
    }

    return { Smells: validatedSmells };
}

function isRangeRule(value: any): value is RangeRule {
    return value.type === 'range';
}

function validateRangeRule(smell: RangeRule) {
    if (!Array.isArray(smell.value) || smell.value.length !== 2 || !isWithinRange(smell.value, smell.valid)) {
        throw new Error(
            `Invalid value for range smell: ${JSON.stringify(smell.value)}

${JSON.stringify(smell, null, 2)}

            `
        );
    }
}

function isEnumRule(value: any): value is EnumRule {
    return value.type === 'enum';
}

function validateEnumRule(smell: EnumRule) {
    if (!isStringInArray(smell.value, smell.valid)) {
        throw new Error(
            ` Invalid value for enum smell: '${smell.value}' is not in valid set.

${JSON.stringify(smell, null, 2)}

            `
        );
    }
}

function isBooleanRule(value: any): value is BooleanRule {
    return value.type === 'boolean';
}

function validateBooleanRule(smell: BooleanRule) {
    if (typeof smell.value !== 'boolean') {
        throw new Error(`Invalid value for boolean smell: '${smell.value}' is not a boolean.

${JSON.stringify(smell)}

`);
    }
}

function isWithinRange(value: [number, number], range: [number, number]) {
    return value[0] >= range[0] && value[1] <= range[1];
}

function isStringInArray(value: string, array: string[]) {
    return array.includes(value);
}

