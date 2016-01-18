import d3 from "d3";
import Vue from 'vue'

const dimensions = {
    width: 960,
    height: 500
};

const color = d3.scale.category20();

const force = d3.layout.force()
    .charge(-120)
    .linkDistance(30)
    .size([dimensions.width, dimensions.height]);

const svg = d3.select("body").append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height);

new Vue({
    el: '#main',
    data: {
        currentSubreddit: 'AskReddit',
        subreddits: [],
        tree: [],
        currentWord: "___BEGIN__"
    },
    methods: {},
    ready(){
        //On load, get the list of subreddits
        d3.json("/api/subreddits", (error, json) => {
            this.subreddits = json;
        });
    },
    watch: {
        //Whenever the current subreddit changes, download new data
        currentSubreddit(sub){
            d3.json(`/api/markov?s=${sub}?w=${this.currentWord}`, (error, json) => {
                this.tree = json;
            });
        },
        tree(val){
            //Whenever the tree updates, rerender it with d3
            render(val);
        }
    }
});


function render(tree) {
    force
        .nodes(tree.nodes)
        .links(tree.links)
        .start();

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function (d) {
            return Math.sqrt(d.value);
        });

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter().append("circle")
        .attr("class", "node")
        .attr("r", 5)
        .style("fill", function (d) {
            return color(d.group);
        })
        .call(force.drag);

    node.append("title")
        .text(function (d) {
            return d.name;
        });

    force.on("tick", function () {
        link.attr("x1", function (d) {
                return d.source.x;
            })
            .attr("y1", function (d) {
                return d.source.y;
            })
            .attr("x2", function (d) {
                return d.target.x;
            })
            .attr("y2", function (d) {
                return d.target.y;
            });

        node.attr("cx", function (d) {
                return d.x;
            })
            .attr("cy", function (d) {
                return d.y;
            });
    });
}
