function getMapHeight() {
    return (window.innerHeight*0.8);
}

function getMapWidth() {
    return (window.innerWidth*0.9);
}

function set_default_edge(edge_list) {
    edges_to_reset = [];
    for(var edgeId of edge_list){
	//console.log(edgeId, allEdges[edgeId]);
	edge = allEdges[edgeId];
	edge["color"]={"color":"black","inherit":false};
	edge["width"]=1;
  edges_to_reset.push(edge);
	
    }
    edges.update(edges_to_reset);
}

 //Set fixed coordinates for Collection and Problem Nodes
 function set_coordinates_for_collection_nodes() {
     
     var step_size = 2*getMapHeight()/7;
     var loop_count=0;
     for(var n in allNodes){
	 x = -5*getMapWidth();
	 
	 if(allNodes[n]["group"]=="Collection") {
	     loop_count+=1;
	     allNodes[n].x = x;
	     allNodes[n].y = loop_count*step_size;
	     allNodes[n]["fixed"] = {x:true, y:true};
	     allNodes[n]["physics"] = false;
	     //console.log(allNodes[n]);
	 }
	 
     }
 } 
 
 function set_coordinates_for_problem_nodes() {
     //Set x,y position for Problem nodes
     step_size = getMapHeight()/4;
     loop_count=0;
     sign=-1;
     for(var n in allNodes){
	 
	 y_offset=getMapHeight();
	 
	 if(allNodes[n]["group"]=="Problem") {
	     loop_count+=1;
	     allNodes[n].y = sign*loop_count*step_size+y_offset;
	     allNodes[n].x = -3*getMapWidth();
	     //allNodes[n].x = x;
	     allNodes[n]["fixed"] = {x:true, y:true};
	     allNodes[n]["physics"] = false;
	     //console.log(allNodes[n]);
	     sign*=-1;
	 }
	 
     }
 }



//initial edge highlight color
//var colors= ["red", "blue", "green", "purple", "yellow", "orange"];
var highlight_color = "red";

function change_highlight_color() {
    //change edge highlight color for next selection
    //random_color=Math.floor(Math.random()*123456789).toString(16);
    //highlight_color = "#"+random_color;
    
    highlight_color ="hsl("+ 360 * Math.random() + ',' +
	( 95 * Math.random()) + '%,' + 
	( 45+10 * Math.random()) + "%)";
    //console.log(highlight_color);
    //var color_index = Math.floor(colors.length*(Math.random()+Math.random())/2);
    //highlight_color = colors[color_index];
}

function highlight_nodes(node_ids) {
    updated_nodes = []
    for(var nodeId of node_ids) {
	//console.log(allNodes[nodeId]);
	allNodes[nodeId].x = network.getPosition(nodeId).x;
	allNodes[nodeId].y = network.getPosition(nodeId).y;
	//allNodes[nodeId].color={"border": "red", "highlight":{"border":"red"}};
	var group = allNodes[nodeId].group;
	var color = {"background":options.groups[group].color, "border": highlight_color, "highlight":{"border":highlight_color, "background":options.groups[group].color}};
	//console.log(nodeId, allNodes[nodeId].label,color);
	//allNodes[nodeId].color={"border": highlight_color, "highlight":{"border":highlight_color}};
	allNodes[nodeId].color=color;
	allNodes[nodeId].borderWidth=4;
	allNodes[nodeId].borderWidthSelected=4;
	updated_nodes.push(allNodes[nodeId]);
	//console.log(allNodes[nodeId].oldcolor, allNodes[nodeId].color);
	//console.log(nodeId);
	//node = allNodes[nodeId];
	//node.color="red";
	//allNodes.update(node);
    }
    //console.log(updated_nodes);
    nodes.update(updated_nodes);
   
    
}

function highlight_edges(edges_list) {
    var edges_to_highlight = []
    for(var edgeId of edges_list) {
	edge = allEdges[edgeId];
        edge.color=highlight_color;
        edge.width=4;
        edges_to_highlight.push(edge);
    }
    edges.update(edges_to_highlight);
}

function gray_out_everything_else() {
    var nodes_to_gray_out = []
    var edges_to_gray_out = []
    //nodes
    for(var [i, node] of Object.entries(allNodes)) {
	//console.log(currently_selected_nodes.includes(node))
        if(!currently_selected_nodes.includes(node.id)) {
            node.color = "rgba(200,200,200,0.4)";
	        node.x = network.getPosition(node.id).x;
	        node.y = network.getPosition(node.id).y;

            nodes_to_gray_out.push(node);
        }      
    }
    for(var [i, edge] of Object.entries(allEdges)) {
	if(!currently_selected_edges.includes(edge.id)) {
            edge.color= "rgba(200,200,200,0.4)";
	    edges_to_gray_out.push(edge);
        }
    }
    
    nodes.update(nodes_to_gray_out);
    edges.update(edges_to_gray_out);
}

//adds list2 to list1, removes duplicates and returns list without duplicates
function concat_to_list_without_duplicates(list1, list2) {
    var l = list1.concat(list2);
    var result_list = [];
    l.forEach(i => {
        if(result_list.indexOf(i)==-1) {
            result_list.push(i);
        }
    });
    return result_list;
}

function node_select_handler(selected_nodes) {
    //hide right click menu if open
    $(".right_click_menu").hide();
    if(selected_nodes.nodes.length==0) {
	//network.redraw();
	//console.log(allNodes);
	var nodes_to_reset = [];
	//get all nodes to default color and position
	for(var [i, node] of Object.entries(allNodes)) {
	        node.color=node.oldcolor;
	    //    if(node.group=="Problem" || node.group=="Collection"){
	    node.x = network.getPosition(node.id).x;
	    node.y = network.getPosition(node.id).y;
	    //    }
	        node.borderWidth=1;
	        node.borderWidthSelected=1;
	        nodes_to_reset.push(node);
	        //console.log(node);
	    }
	nodes.update(nodes_to_reset);
	//get all edges to default color
	//set_default_edge(currently_selected_edges);
	set_default_edge(list_of_all_edges);
	currently_selected_edges = [];
	currently_selected_nodes = [];

    }
    else {
	//console.log(selected_nodes.nodes);
	//console.log(selected_nodes.edges);
	for(var nodeId of selected_nodes.nodes) {
	        //var node = allNodes[nodeId];
	        //console.log(node);
	        //console.log(currently_selected_nodes);
	        var neighbour_nodes = network.getConnectedNodes(nodeId);
	        //console.log(neighbour_nodes);
	        //var neighbour_edges = network.getConnectedEdges(nodeId);
	        var neighbour_edges = selected_nodes.edges;
	        /*
		        currently_selected_edges = currently_selected_edges.concat(neighbour_edges);
			      currently_selected_nodes = currently_selected_nodes.concat(nodeId);
			            currently_selected_nodes = currently_selected_nodes.concat(neighbour_nodes);
				        */
	        currently_selected_edges = concat_to_list_without_duplicates(currently_selected_edges, neighbour_edges);
	        currently_selected_nodes = concat_to_list_without_duplicates(currently_selected_nodes, neighbour_nodes.concat(nodeId));
	        /*
		        for(var neighbour_node_id of neighbour_nodes) {
			      currently_selected_nodes = currently_selected_nodes.concat(neighbour_node_id);
			            }
				        */
	        //console.log(currently_selected_nodes);
	        var all_nodes_to_highlight = neighbour_nodes;
	        all_nodes_to_highlight = all_nodes_to_highlight.concat(nodeId);
	        //console.log(nodeId);
	        //console.log(typeof(all_nodes_to_highlight), all_nodes_to_highlight);
	        //console.log(neighbour_edges.length);
	        //console.log(currently_selected_edges);
	        //all_nodes_to_highlight.push(nodeId);
	    }
	//console.log(all_nodes_to_highlight);
	//console.log(currently_selected_nodes);
	highlight_nodes(all_nodes_to_highlight);
	gray_out_everything_else();
	highlight_edges(neighbour_edges);
	
	//change highlight color
	change_highlight_color();
    }
    
}

function node_right_click_handler(obj) {
    obj.event.preventDefault();
    //set url
    nodeid = network.getNodeAt({x:obj.pointer.DOM.x, y:obj.pointer.DOM.y});
    //var menu = document.querySelector(".right_click_menu"); 
    if(nodeid===undefined) {
        $(".right_click_menu").hide();
        return;
    }
    node = allNodes[nodeid];
    //console.log(node);
    //menu.style.display==="inline";
    //check if there is a description for this node
    
    $(".right_click_menu").toggle();
    //if visible, set the values
    if($(".right_click_menu").is(":visible")) {
	//set label
	$("[id='heading']").html(node.label);
	//set description
	if(node.description===undefined) {
	        $("[id='description']").empty();
	    }
	else {
	        $("[id='description']").html(node.description);
	    }
	
	if(node.url===undefined) {
	        $("[id='urls']").empty();
	    }
	else {
	        urls = (node.url).split(',');

	        for(url of urls) {
      
		    var a_element = $('<a>');
		    a_element.html(url);
		    a_element.attr("href", url);
		    a_element.attr("target", "_blank");

		    $("[id='urls']").append(a_element);
		}    
	    }
    }
    else {

	//set label
	$("[id='heading']").empty();
	//set description
	$("[id='description']").empty();
	//set url
	$("[id='urls']").empty();
	
    }

    //set menu style
    $(".right_click_menu").css({
	top: obj.event.pageY + "px",
	left: obj.event.pageX + "px",
        width:"20%",
        //display: "none",
	"z-index": "1000",
	position: "absolute",
	overflow: "hidden",
        "overflow-wrap":"break-word",
	border: "1px solid #CCC",
	"white-space": "wrap",
	"font-family": "sans-serif",
	//background: "#FFFF",
        background: options.groups[node.group].color,
	//color: node.color.background,//"#333",
	"border-radius": "5px",
    });
    
    //console.log(node);
}



