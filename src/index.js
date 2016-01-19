import d3 from "d3";
import Vue from 'vue'
import clone from 'clone'
import copy from 'shallow-copy';

const outerDimensions = {
    width: 1000,
    height: 1000
};
const margins = {
    x: 100,
    y: 100
};
const dimensions = {
    width: outerDimensions.width - (2 * margins.x),
    height: outerDimensions.height - (2 * margins.y)
};

const LINK_WIDTH = 5;
const DEFAULT_NODES = {
    name: "___BEGIN__",
    children: [{
        name: "___BEGIN__",
        state: 'open',
        weight: 1
    }],
    x0: dimensions.height / 2,
    y0: 0,
    state: 'open'
};
const duration = 750;
const DEFAULT_STATE = [0, 1]; //By default the current state is the first two nodes: ___BEGIN__

const diagonal = d3.svg.diagonal()
    .projection(function (d) {
        return [d.y, d.x];
    });

let tree = d3.layout.tree()
    .size([dimensions.width - (2 * margins.x), dimensions.height - (2 * margins.y)])
    .separation((a, b) => {
        return 0.5;// return a.parent == b.parent ? 1 : 1;
    });

const outerSvg = d3.select("#chart").append("svg")
    .attr("width", outerDimensions.width)
    .attr("height", outerDimensions.height);

const svg = outerSvg
    .append("g")
    .attr("transform", `translate(${margins.x}, ${margins.y})`);

outerSvg.append("defs").html(`
  <pattern id="loader" patternUnits="userSpaceOnUse" width="100" height="100">
    <image xlink:href="static/loader.gif" x="0" y="0" width="100" height="100" />
  </pattern>`);

const vm = new Vue({
    el: '#main',
    data: {
        currentSubreddit: 'AskReddit',
        subreddits: [],
        root: copy(DEFAULT_NODES),
        //links: copy(DEFAULT_LINKS),
        state: [],
        nextNodeId: 0
    },
    computed: {
        secondRoot(){
            return this.root.children[0];
        }
    },
    methods: {
        clickNode(d) {
            if (!d.children && !d._children) {
                this.fetchData(d);
            }
            else {
                if (d.children) {
                    d._children = d.children;
                    d.children = null;
                } else {
                    d.children = d._children;
                    d._children = null;
                }
                this.render(d);
            }
        },
        render(source) {

            var nodes = tree.nodes(this.root).reverse();
            var links = tree.links(nodes);

            // Normalize for fixed-depth.
            //nodes.forEach(function (d) {
            //    d.y = d.depth * 90;
            //});

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, d => {
                    return d.id || (d.id = this.nextNodeId++);
                });

            node.style("fill", d => {
                switch (d.state) {
                    case "open":
                        return "white";
                    case "closed":
                        return "black";
                    case "loading":
                        return "url(#loader)";

                }
            });

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node.enter().append("g")
                .attr("class", "node")
                .attr("transform", d => {
                    return "translate(" + source.y0 + "," + source.x0 + ")";
                })
                .on("click", this.clickNode);

            nodeEnter.append("circle")
                .attr("r", 1e-6)
            //.style("fill", function (d) {
            //    return d._children ? "white" : "#fff";
            //});

            nodeEnter.append("text")
                .attr("x", function (d) {
                    return d.children || d._children ? -10 : 10;
                })
                .attr("dy", ".35em")
                .attr("text-anchor", function (d) {
                    return d.children || d._children ? "end" : "start";
                })
                .text(function (d) {
                    let weight = d.weight ? ` (${d.weight})` : "";
                    return `${d.name}${weight}`;
                })
                .style('fill', 'white')
                .style("fill-opacity", 1e-6);

            // Transition nodes to their new position.
            var nodeUpdate = node.transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.y + "," + d.x + ")";
                });

            nodeUpdate.select("circle")
                .attr("r", 4.5)
            //.style("fill", function (d) {
            //    return d._children ? "lightsteelblue" : "#fff";
            //});

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node.exit().transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.y + "," + source.x + ")";
                })
                .remove();

            nodeExit.select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Update the links…
            var link = svg.selectAll(".link")
                .data(links, function (d) {
                    return d.target.id;
                });

            // Enter any new links at the parent's previous position.
            var linkEnter = link
                .enter()
                .append('g')
                .attr("class", "link");

            //link
            //    .selectAll('path')
            //    .attr("d", function (d) {
            //        var o = {x: source.x, y: source.y};
            //        return diagonal({source: o, target: o});
            //    })
            //    .style('stroke-width', d => (d.target.weight / d.source.totalWeight * 20) + 'px');

            var linkLine = linkEnter
                .append("path")
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .attr('stroke', 'white')
                .style('fill', 'none')
                .style('stroke-width', d => (d.target.weight / d.source.totalWeight * 20) + 'px');

            //linkEnter
            //    .append("text")
            //    .attr("transform", function (d) {
            //        let x = (d.source.x + d.target.x) /2;
            //        let y = (d.source.y + d.target.y) /2;
            //        return `translate(${y}, ${x})`;
            //    })
            //    .style('stroke', 'white')
            //    .text(d => d.target.weight);

            // Transition links to their new position.
            linkLine.transition()
                .duration(duration)
                .attr("d", diagonal);

            link.exit().remove();

            // Transition exiting nodes to the parent's new position.
            //link.exit().selectAll('line').transition()
            //    .duration(duration)
            //    .attr("d", function (d) {
            //        var o = {x: source.x0, y: source.y0};
            //        return diagonal({source: o, target: o});
            //    })
            //    .remove();

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        },

        fetchData(node){
            node.state = 'loading';
            this.render(node);
            const sub = this.currentSubreddit;
            const s1 = node.parent.name;
            const s2 = node.name;
            d3.json(`/api/markov?sub=${sub}&s1=${s1}&s2=${s2}`, (error, json) => {

                //Process the data
                let result = json.top_ten;
                result.forEach(node => {
                    node.state = 'closed';
                });

                //Update the parent node
                node.totalWeight = result.reduce((prev, curr) => prev + curr.weight, 0);
                node.state = 'open';
                node.children = result;

                //Rerender
                this.render(this.root);
            });
        },
        loadInitial(){
            this.fetchData(this.secondRoot);
        }
    },
    ready(){

        this.state.push(this.root, this.root.children[0]);

        //On load, get the list of subreddits
        d3.json("/api/subreddits", (error, json) => {
            this.subreddits = json;
        });

        this.render(this.root);
    },
    watch: {
        subreddits(){
            //Whenever the subreddit list is updated, fetch nodes
            this.loadInitial();
        },
        //Whenever the current subreddit changes, download new data
        currentSubreddit(){
            this.secondRoot.children = [];
            this.loadInitial();
            this.render(this.root);
        },
        links(val){
            //Whenever the tree updates, rerender it with d3
            this.render(val);
        },
        //state(){
        //    //Whenever the word updates, fetch the new nodes
        //    this.loadInitial();
        //}
    }
});

window.vm = vm;