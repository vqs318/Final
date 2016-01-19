function printNodes(node, depth) {
    var ret = "";
    for (var i = 0; i < depth; i++)
        ret += '   ';
    ret += node.name + ":";
    console.log(ret);
    if (node.children)
        node.children.forEach(child => {
            printNodes(child, depth + 1)
        })
}