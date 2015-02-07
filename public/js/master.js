$(function(){
	var socket = io.connect();
	var MSG_TYPE = {0:"image", 1:"medias", 2:"text"}

	/********** Native JS functions **********/
	function displayMsg(data){
		switch(data.type){
			case MSG_TYPE[0]:
				var html = 
						"<span class='msg'><strong>" + data.nick + ":</strong> " + 							'<img style="width: 200px;" src="' + data.imgContent + '" />'
				break;
			case MSG_TYPE[1]:
				var html = 
						"<span class='msg'><strong>" + data.nick + ":</strong> " 
						+
						'<img style="width: 200px;" src="' + data.imgContent + '" />'
						+
						data.txtContent
						
				break;
			case MSG_TYPE[2]:
				var html = "<span class='msg'><strong>" + data.nick + ":</strong> " + 							data.txtContent;
				break;
		}
		$('#chat').append(html);
    }
	
	
	socket.on('message', function(data){
    	displayMsg(data);
    });

    socket.on('load old msgs', function(docs){
    	for (var i = docs.length-1; i >= 0; i--) {
    		displayMsg(docs[i]);
    	}
    });
	

});