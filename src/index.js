//Imports
import d3 from "d3";
import Vue from 'vue'
import clone from 'clone'
import copy from 'shallow-copy';
import d3Tip from "d3-tip";
d3.tip = d3Tip;

//SVG rendering constants
const containerEl = document.getElementById('chart');

//Make the SVG as big as the screen makes it
const outerDimensions = {
    width: containerEl.clientWidth,
    height: containerEl.clientHeight
};

//Move the first node down from the top slightly.
const margins = {
    x: 0,
    y: 50
};

//Inner dimensions (minus the margin)
const dimensions = {
    width: outerDimensions.width - (2 * margins.x),
    height: outerDimensions.height - (2 * margins.y)
};

//The root node that we use regardless of subreddit
const DEFAULT_ROOT = {
    name: "<Start>",
    children: [],
    x0: dimensions.width / 2,
    y0: 0,
    state: 'closed',
    id: 0
};

//Size of each <rect> node
const RECT_SIZE = {
    width: 50,
    height: 20
};

//The length of time it takes to open nodes (animation time)
const duration = 750;

//Calculate the transition locations used for the edges (lines).
//Note that source.y is + 10. This means that the paths don't go to the centre of the nodes, but
//rather touch the edges
const diagonal = d3.svg.diagonal()
    .source(d => ({x: d.source.x, y: d.source.y + 10}))
    .projection(d => [d.x, d.y]);

//D3 tree layout for calculating node positions
const tree = d3.layout.tree()
    .size([dimensions.width - (2 * margins.x), dimensions.height - (2 * margins.y)])
    .separation((a, b) => {
        return 5;// return a.parent == b.parent ? 1 : 1;
    });

//Create the SVG element
const outerSvg = d3.select("#chart").append("svg")
    .attr("width", outerDimensions.width)
    .attr("height", outerDimensions.height);

//Create a group inside the SVG that exludes the margin
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

//The SVG 'defs' section. Contains the loading spinner and a drop shadow implementation for Chrome.
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
        subreddits: [], //List of available subreddits
        root: null, //The root node of the tree
        nextNodeId: 0, //Id to give the next generated node
        sentence: "", //The current sentence constructed by the user,
        settings: {
            orderBy: 'largest',
            numNodes: 10
        }
    },
    methods: {
        /**
         * When someone left clicks a node, fetch data for them if they have no data.
         * If they have data, toggle their children.
         * @param d. The node we've clicked on.
         */
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

        /**
         * Construct a sentence by walking upwards in the tree from the selected node.
         * @param node
         */
        constructSentence(node){
            const sentenceArray = [];
            const endOfSentence = ['.', '!', '?'];

            //Loop until the root node, adding each word to the sentence array
            let currentNode = node;
            while (currentNode.parent) {
                sentenceArray.push(currentNode.name);
                currentNode = currentNode.parent;
            }

            //Reverse the array and capitalise words if necessary, then join the array into a sentence
            this.sentence = sentenceArray
                .reverse()
                .map((word, i)=> {
                    const capitalised = word[0].toUpperCase() + word.slice(1);

                    //Capitalise words if they're followed by a full stop or they're the first word.
                    if (i == 0 ||
                        ( (i + 1) in sentenceArray && endOfSentence.indexOf(sentenceArray[i - 1]) != -1)
                    )
                        return capitalised;
                    else
                        return word;
                })
                .join(" ");

            //Stop the right click menu showing
            d3.event.preventDefault();

            //Show the new sentence
            this.$els.sentence.scrollIntoView(true);
        },

        reset(){
            this.root.children = [];
            this.render(this.root);
        },

        /**
         * Updates the SVG render
         * @param source The node element that we're adding new nodes to. Used only for sake of transitions
         */
        render(source) {

            //Use the D3 tree layout to generate nodes and links
            var nodes = tree.nodes(this.root).reverse();
            var links = tree.links(nodes);

            // Normalize the nodes so that each depth level is always same distance from each other.
            // As opposed to the normal d3.tree behaviour which is to make the distance shorter as the
            // tree becomes higher, in order to always use up all vertical space (which we don't want)
            nodes.forEach(d => {
                d.y = d.depth * 90;
            });

            //
            //Render the links
            //

            // Update the links with data
            var link = svg.selectAll(".link")
                .data(links, d => d.target.id);

            // For each new link, create a path between the two nodes
            link
                .enter()
                .append("path")
                .attr("class", "link")
                .attr("d", d => {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                //The stroke width is a function of the weighting
                .style('stroke-width', d => (d.target.weight / d.source.totalWeight * 20) + 'px');

            // Transition links to their new position.
            link
                .transition()
                .duration(duration)
                .attr("d", diagonal);

            // Transition exiting links to the parent node before deleting
            link
                .exit()
                .transition()
                .duration(duration)
                .attr("d", d => {
                    var o = {x: source.x, y: source.y};
                    return diagonal({source: o, target: o});
                })
                .remove();

            //
            //Render the nodes
            //

            // Update the nodes with data
            var node = svg
                .selectAll("g.node")
                .data(nodes, node => node.id);

            // Each node is a <g> element containing a <rect> and <text>
            // Enter any new nodes at the parent's previous position.
            var nodeEnter = node
                .enter()
                .append("g")
                .attr("class", "node")
                .attr("transform", d => {
                    return "translate(" + source.x0 + "," + source.y0 + ")";
                })
                .on("contextmenu", this.constructSentence)
                .on("click", this.clickNode)
                .on('mouseover', toolTip.show)
                .on('mouseout', toolTip.hide);

            nodeEnter
                .append("rect")
                //Move the rectangle into the centre of the node
                .attr("transform", d => {
                    return `translate(${-RECT_SIZE.width / 2}, ${-RECT_SIZE.height / 2})`;
                })
                .attr("width", RECT_SIZE.width)
                .attr("height", RECT_SIZE.height);


            nodeEnter
                .append("text")
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
                .select('text')
                .text(d => {
                    if (d.state == 'loading')
                        return "";
                    else
                        return d.name;
                });

            //If the node is loading, make the <rect> look like a spinner
            node
                .select('rect')
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
                .attr("transform", d => {
                    return "translate(" + d.x + "," + d.y + ")";
                });

            //Hide text while doing so
            nodeUpdate
                .select("text")
                .style("fill-opacity", 1);

            // Transition exiting nodes to the parent's new position.
            var nodeExit = node
                .exit()
                .transition()
                .duration(duration)
                .attr("transform", d => {
                    return "translate(" + source.x + "," + source.y + ")";
                })
                .remove();

            //Hide the text if we're about to delete a node
            nodeExit
                .select("text")
                .style("fill-opacity", 1e-6);

            // Stash the old positions for transition.
            nodes.forEach(d => {
                d.x0 = d.x;
                d.y0 = d.y;
            });
        },

        /**
         * Ask the database for data, using the node's dbId: its index in the database
         */
        fetchData(node){
            //Set the loading state on the parent so that it turns into a spinner
            node.state = 'loading';
            this.render(node);

            //Request the data
            d3.json(
                `/api/markov?node=${node.dbId}&order=${this.settings.orderBy}&num=${this.settings.numNodes}`,
                (error, json) => {

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

        /**
         * Fetches the dbId of the root node which we always need.
         */
        loadInitial(){
            const sub = this.currentSubreddit;
            d3.json(`/api/initial?sub=${sub}&s1=___BEGIN__&s2=___BEGIN__`, (error, json) => {
                this.root = clone(DEFAULT_ROOT);
                this.root.dbId = json.id; //Used for queries, not for data identification
                this.render(this.root);
            });
        }
    },
    ready(){
        //On load, get the list of subreddits
        d3.json("/api/subreddits", (error, json) => {
            this.subreddits = json;
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
        }
    }
});

//Export the vm to the window for debugging
window.vm = vm;