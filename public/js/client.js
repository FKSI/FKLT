$(function(){
	/********** Variables init **********/
	var socket = io.connect();
	var _msg = { _type:'', _txtContent:'', _imgContent:'' }
	resetInputFile();
	
	/********** Native JS functions **********/
	function displayMsg(msg, nick){
    	var html = "<span class='msg'><strong>" + nick + ":</strong> " + msg;
    	$('#chat').append(html);
    }
	

	function displayUsers(users){
		var html = '';
		for (var i = 0; i < users.length; i++) {
			html += '<div class="user" id="user' + users[i].id + '">' + users[i].nick + 					'</span>';
		}
		$('#users').append(html);
	    $('.user').click(function(e){
	    	if (!userToPM) {
	    		$('#pm-col').show();
	    	}
	    	userToPM = $(this).attr('id').substring(4);
	    	$('#user-to-pm').html('<h2>' + $(this).text() + '</h2>');
	    });
	}
	
	
	function resetInputFile(){
		document.getElementById("send-message").reset();
	}
	
	/********** jQuery functions **********/
	$('#choose-nickname').submit(function(e){
		e.preventDefault();
		var nick = $('#nickname').val();
		socket.emit('choose nickname', nick, function(err){
			if (err) {
				$('#nick-error').text(err);
				$('#nickname').val('');
			} else {
				$('#nickname-container').hide();
				$('#chat-container').show();
			}
		});
	});

    $('#sendMsgBtn').click(function(e){
        e.preventDefault();
        var txtContent = $('#new-message').val();
		var imgContent = '';		
		
		if (window.File && window.FileReader && window.FileList && window.Blob) {
			var file = document.getElementById("filesToUpload").files[0];
			if(file != undefined){
				if (file.type.match('image.*')) {
					reader = new FileReader();
					reader.onload = function(evt){        			
						
						// Set the preview
						var div = document.createElement('div');
						div.id = "image-preview";
						div.innerHTML = '<img style="width: 90px;" src="' + 													evt.target.result + '" />';
						document.getElementById('filesInfo').appendChild(div);
						imgContent = evt.target.result;
						
						// Handle image messages w/ or w/o text
						if(txtContent != ''){
							_msg._type = "medias";
							_msg._txtContent = txtContent;
							_msg._imgContent = imgContent;
						}else{
							_msg._type = "image";
							_msg._imgContent = imgContent;
						}
						
						socket.emit('message', evt.target.result);
						
						// Remove preview
						$('#image-preview').remove();
					};
					reader.readAsDataURL(file); 
				}
			}else if (txtContent != ''){
				_msg._type = "text";
				_msg._txtContent = txtContent;
				
				console.log("Emitting _msg %O", _msg);
				socket.emit('message', txtContent);
			}
		}else{
			alert('The File APIs are not fully supported in this browser.');
		}
		
		
		resetInputFile();
        $('#new-message').val('');
    });    
	
	/********** socket.io listenners **********/
    socket.on('message', function(data){
    	displayMsg(data.msg, data.nick)
    });

    socket.on('load old msgs', function(docs){
    	for (var i = docs.length-1; i >= 0; i--) {
    		displayMsg(docs[i].msg, docs[i].nick);
    	}
    });
	
	socket.on('names', function(users) {
		displayUsers(users);
	});

	socket.on('new user', function(user) {
		displayUsers([user]);
	});
	
	socket.on('user disconnect', function(id){
		console.log(id);
		$('#user'+id).remove();
	});

});