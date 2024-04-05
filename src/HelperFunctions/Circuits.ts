import { Dependency, SymbolTableJson } from "../SymbolTable";
export function get_dependency_circles(dependencies: Dependency[]) {
    let list = get_adjacency_list(dependencies);
    return new Graph(list).getStronglyConnectedComponents().filter(x => x.length > 1);

    // for (const circuit of circuits) {
    //     let structure = ST.structures[circuit[0]].name;
    //     let msg = `Structure: "${structure}" is part of this dependency cycle: \n`;
    //     for (let i = 0; i < circuit.length - 1; i++) {
    //         msg += `${circuit[i]} -> `;
    //     }
    //     msg += `${circuit[circuit.length - 1]}\n`;
    //     console.log(msg)
    // }
}

export function get_adjacency_list(dependencies: Dependency[]) {
    let adjacency_list: Map<string, string[]> = new Map();
    for (const dep of dependencies) {
        if (adjacency_list.has(dep.from)) adjacency_list.get(dep.from)?.push(dep.to)
        else adjacency_list.set(dep.from, [dep.to])
    }
    return adjacency_list;
}

class Graph {
    public arrows: Map<string, string[]>
    public nodes: string[]

    constructor(adjacency_list: Map<string, string[]>) {
        this.arrows = adjacency_list;
        this.nodes = Array.from(adjacency_list.keys());
    }

    // Tarjan's strongly connected components algorithm
    getStronglyConnectedComponents() {
        let index = 0;
        let stack: string[] = [];
        let result: string[][] = [];
        let meta = new Map();

        let graph = this;

        const connect = function connect(node: string) {
            let entry = {
                onstack: true,
                index: index,
                lowlink: index
            };

            meta.set(node, entry);
            stack.push(node);
            index += 1;

            graph.arrows.get(node)?.forEach(function (adj) {
                if (!meta.has(adj)) {
                    // adjacent node has not yet been visited, do it
                    connect(adj);
                    entry.lowlink = Math.min(entry.lowlink, meta.get(adj).lowlink);
                } else if (meta.get(adj).onstack) {
                    entry.lowlink = Math.min(entry.lowlink, meta.get(adj).index);
                }
            });

            // check if node is a root node, pop the stack and generated an scc
            if (entry.lowlink === entry.index) {
                let scc = [];
                let adj = null;

                do {
                    adj = stack.pop();
                    if (adj == undefined) throw Error;
                    meta.get(adj).onstack = false;
                    scc.push(adj);
                } while (node !== adj);

                result.push(scc);
            }
        };

        graph.nodes.forEach(function (node) {
            if (!meta.has(node)) {
                connect(node);
            }
        });

        return result;
    }

// // Based on Donald B. Johnson 1975 paper
// // Finding all the elementary circuits of a directed graph
// findCircuits() {
//     type NODE_ID = string
//     let s: NODE_ID
//     let A: Map<NODE_ID, Array<NODE_ID>> = new Map()
//     let B: Map<NODE_ID, Array<NODE_ID>> = new Map()
//     const blocked: Map<NODE_ID, boolean> = new Map()
//     const stack: NODE_ID[] = []
//     function circuit(n: NODE_ID) {
//         let f: boolean
//         function unblock(u: NODE_ID) {
//             blocked.set(u, false)
//             B.get(u)?.forEach(w => { if (blocked.has(w)) { unblock(w) } })
//             B.delete(u)
//         }
//         f = false
//
//         stack.push(n)
//         blocked.set(n, true)
//         A.get(n)?.forEach(w => {
//             if (w === s) {
//                 stack.push(s)
//                 console.log(stack)
//                 console.log("HERE")
//                 f = true
//             }
//             else if (!blocked.has(w)) {
//                 console.log("nothing")
//                 if (circuit(w)) f = true;
//             }
//         })
//         if (f) unblock(n)
//         else A.get(n)?.forEach(w => {
//             if (B.get(w)?.find(x => x === n) === undefined) { B.get(w)?.push(n) }
//         })
//         stack.pop()
//         return f
//     }
//     stack.length = 0
//     this.nodes.forEach(node => { s = node; this.arrows.get(node)?.forEach(a_node => { circuit(a_node) }) })
//
//
//     // return circuits;
// };


}
