import d3 from "d3";
import Vue from 'vue'
import clone from 'clone'
import copy from 'shallow-copy';
import d3Tip from "d3-tip";
d3.tip = d3Tip;

const containerEl = document.getElementById('chart');
const outerDimensions = {
    width: containerEl.clientWidth,
    height: containerEl.clientHeight
};
const margins = {
    x: 0,
    y: 50
};
const dimensions = {
    width: outerDimensions.width - (2 * margins.x),
    height: outerDimensions.height - (2 * margins.y)
};
const DEFAULT_ROOT = {
    name: "<Start>",
    children: [],
    x0: dimensions.width / 2,
    y0: 0,
    state: 'open',
    id: 0
};
const RECT_SIZE = {
    width: 50,
    height: 20
};
const duration = 750;

const diagonal = d3.svg.diagonal()
    .source(d => ({x: d.source.x, y: d.source.y + 10}))
    .projection(function (d) {
        return [d.x, d.y];
    });

let tree = d3.layout.tree()
    .size([dimensions.width - (2 * margins.x), dimensions.height - (2 * margins.y)])
    .separation((a, b) => {
        return 5;// return a.parent == b.parent ? 1 : 1;
    });

const outerSvg = d3.select("#chart").append("svg")
    .attr("width", outerDimensions.width)
    .attr("height", outerDimensions.height);

const svg = outerSvg
    .append("g")
    .attr("transform", `translate(${margins.x}, ${margins.y})`);

//Setup tooltips
const toolTip = d3
    .tip()
    .attr('class', 'd3-tip')
    .html(d=> {
        switch (d.name) {
            //If it's a special node, give it a unique title. Otherwise give information about the node
            case "___BEGIN__":
            case "<Start>":
                return "Start Node";
            case "___END__":
                return "End Node";
            default:
                let parentWeight = d.parent.totalWeight;
                let weightDecimal = (d.weight / parentWeight).toFixed(3);

                return `Word: '${d.name}'<br>` +
                    `Weight: ${weightDecimal}<br>` +
                    `Occurrences: ${d.weight}`;
        }
    });

svg.call(toolTip);

outerSvg.append("defs").html(`
  <pattern id="loader" patternUnits="userSpaceOnUse" width="100" height="100">
    <image xlink:href="static/loader.svg" width="50" height="20" />
  </pattern>
  <filter id="dropshadow" height="130%">
  <feGaussianBlur in="SourceAlpha" stdDeviation="3"/> <!-- stdDeviation is how much to blur -->
  <feOffset dx="2" dy="2" result="offsetblur"/> <!-- how much to offset -->
  <feMerge>
    <feMergeNode/> <!-- this contains the offset blurred image -->
    <feMergeNode in="SourceGraphic"/> <!-- this contains the element that the filter is applied to -->
  </feMerge>
</filter>`);

const vm = new Vue({
    el: '#main',
    data: {
        currentSubreddit: 218,// (/r/unitedkingdom)
        subreddits: [],
        root: null,
        //links: copy(DEFAULT_LINKS),
        state: [],
        nextNodeId: 0
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
            nodes.forEach(function (d) {
                d.y = d.depth * 90;
            });

            // Update the links…
            var link = svg.selectAll(".link")
                .data(links, d => d.target.id);

            // Enter any new links at the parent's previous position.
            var linkEnter = link
                .enter()
                .append('g')
                .attr("class", "link");

            var linkLine = linkEnter
                .append("path")
                .attr("d", function (d) {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .attr('stroke', 'white')
                .style('fill', 'none')
                .style('stroke-width', d => (d.target.weight / d.source.totalWeight * 20) + 'px');


            // Transition links to their new position.
            link
                .selectAll('path')
                .transition()
                .duration(duration)
                .attr("d", diagonal);

            link.exit().remove();

            // Update the nodes…
            var node = svg.selectAll("g.node")
                .data(nodes, node => node.id);

            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", d => {
                    return "translate(" + source.x0 + "," + source.y0 + ")";
                })
                .on("click", this.clickNode)
                .on('mouseover', toolTip.show)
                .on('mouseout', toolTip.hide);

            nodeEnter
                .append("rect")
                //.style("stroke", d => {
                //    switch (d.state) {
                //        case "open":
                //            return "white";
                //        case "closed":
                //            return "black";
                //        case "loading":
                //            return "url(#loader)";
                //
                //    }
                //})
                //Move the rectangle into the centre of the node
                .attr("transform", d => {
                    return `translate(${-RECT_SIZE.width / 2}, ${-RECT_SIZE.height / 2})`;
                })
                .attr("width", RECT_SIZE.width)
                .attr("height", RECT_SIZE.height);


            nodeEnter.append("text")
                .attr("dy", ".35em")
                .style("fill-opacity", 1e-6)
                .style('font-weight', d => {
                    switch (d.name) {
                        case "<Start>":
                        case "___BEGIN__":
                        case "___END__":
                            return "bold";
                        default:
                            return false;
                    }
                });

            //If the node is loading, hide the text
            node
                .selectAll('text')
                .text(function (d) {
                    if (d.state == 'loading')
                        return "";
                    else
                        return d.name;
                });

            //If the node is loading, make it look like a spinner
            node
                .selectAll('rect')
                .style('fill', d => {
                    if (d.state == 'loading')
                        return 'url(#loader)';
                    else
                        return 'white';
                });

            // Transition nodes to their new position.
            var nodeUpdate = node
                .transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            nodeUpdate.select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node
                .exit()
                .transition()
                .duration(duration)
                .attr("transform", function (d) {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();

            nodeExit
                .select("circle")
                .attr("r", 1e-6);

            nodeExit.select("text")
                .style("fill-opacity", 1e-6);

            // Stash the old positions for transition.
            nodes.forEach(function (d) {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        },

        fetchData(node){
            node.state = 'loading';
            this.render(node);
            d3.json(`/api/markov?node=${node.dbId}`, (error, json) => {

                //Process the data
                let totalWeight = 0;
                json.forEach(node => {
                    totalWeight += node.weight;
                    node.state = 'closed';
                    node.id = ++this.nextNodeId;
                });

                //Update the parent node
                node.totalWeight = totalWeight;
                node.state = 'open';
                node.children = json;

                //Rerender
                this.render(node);
            });
        },
        loadInitial(){
            const sub = this.currentSubreddit;
            d3.json(`/api/initial?sub=${sub}&s1=___BEGIN__&s2=___BEGIN__`, (error, json) => {
                this.root = copy(DEFAULT_ROOT)
                this.root.dbId = json.id; //Used for queries, not for data identification
                this.render(this.root);
            });
            //this.fetchData(this.secondRoot);
        }
    },
    ready(){

        //On load, get the list of subreddits
        d3.json("/api/subreddits", (error, json) => {
            this.subreddits = json;
            //this.currentSubreddit = json[0].id;
            this.loadInitial();
        });
    },
    watch: {
        subreddits(){
            //Whenever the subreddit list is updated, fetch nodes
            this.loadInitial();
        },
        //Whenever the current subreddit changes, download new data
        currentSubreddit(){
            this.loadInitial();
        },
        links(val){
            //Whenever the tree updates, rerender it with d3
            this.render(val);
        }
        //state(){
        //    //Whenever the word updates, fetch the new nodes
        //    this.loadInitial();
        //}
    }
});

window.vm = vm;