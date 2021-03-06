/* Columbia University Library
   Project: Synchronizer Module
   File: script.js
	 Description: Javascript functions providing file upload and display
   Author: Ashley Pressley
   Date: 12/04/2017
	 Version: 0.2.2
*/

// Here is our error handling
function errorHandler(e) {
	$("#errorBar").show();
  $('#errorBar').html('<i id="close" class="fa fa-times-circle-o close"></i><p class="error-bar"><i class="fa fa-exclamation-circle"></i> ' + e + '</p><hr />');
	$('html, body').animate({ scrollTop: 0 }, 'fast');

	document.getElementById('close').addEventListener('click', function() {
		$(this).parent('div').fadeOut();
	}, false);
}

// Here we play audio files in the video control player
function renderVideo(file) {
	$("#video").show();
	$("#audio").hide();

	var reader = new FileReader();
  try {
  	reader.onload = function(event) {
  		var target = event.target.result;
  		var videoNode = document.querySelector('video');

  		videoNode.src = target;
			$("#media-upload").hide();
  	}
  }
  catch (e) {
		errorHandler(e);
		$("#media-upload").show();
	}

	reader.readAsDataURL(file);
}

// Here we play audio files in the audio control player
function renderAudio(file) {
	$("#audio").show();
	$("#video").hide();

	var reader = new FileReader();
  try {
  	reader.onload = function(event) {
  		var target = event.target.result;
  		var audioNode = document.querySelector('audio');

  		audioNode.src = target;
			$("#media-upload").hide();
  	}
  }
  catch (e) {
		errorHandler(e);
		$("#media-upload").show();
	}

	reader.readAsDataURL(file);
}

// Here we display text file data
function renderText(file, ext) {
	var reader = new FileReader();
  try {
  	reader.onload = function(event) {
  		var target = event.target.result;

			// This will use RegEx to make an as appropriate guess at the primary language of the file
      guessLanguage.name(target, function(languageName) {
      	$('#language').html("Documents provided are in " + languageName + ".");
      });

			// Based upon example files, the following appears to be true:
			// Metadata (aka Index) information comes from
			// 	- XML files with the root of metadata
			//  - TXT WebAnno files
			// Transcript (including Captions) information comes from
			//  - TXT files
			// 	- SRT files
			// Metadata and Transcript information can also come from
			//  - XML files following the OHMS schema
			// 	- VTT files

			if (target.indexOf("WebVTT") > -1 || ext == "vtt") {
				if (target.indexOf("Kind:") > -1) {
					var breaks = target.split(/(00:00:0)/);
					for (var i = 0; i < breaks.length; i++) {
						// The end bits are the Transcript
						if (i >= breaks.length - 2) document.getElementById('transcript').value += breaks[i];
						// Index information is at the beginning
						else document.getElementById('index').value += breaks[i];
					}
				}
				else if (target.indexOf("WebAnno") > -1) document.getElementById('index').value += target;
				// Either cannot discern metadata from transcript, or there isn't any
				else document.getElementById('transcript').value += target;
			}
			else if (ext == "txt" || ext == "srt") document.getElementById('transcript').value += target;
			else if (target.indexOf("</metadata>") > -1) document.getElementById('index').value += target;
			else if (ext == "xml") {
				// Index information from Root to Transcript
				document.getElementById('index').value += target.slice(0, target.indexOf("<transcript>"));
				// Then there is Transcript
				document.getElementById('transcript').value += target.slice(target.indexOf("<transcript>"), target.indexOf("<transcript_alt>"));
				// Then more index information
				document.getElementById('index').value += target.slice(target.indexOf("<transcript_alt>"));
			}
			else {
				document.getElementById('transcript').value += target;
				errorHandler(new Error("Cannot determine as index or transcript."));
			}
  	}
  }
  catch (e) { errorHandler(e); }

	reader.readAsText(file);
}

// Here we prepare the information for export
function exportFile(sender) {
	var file = null;

	switch(sender) {
		case "xml":
			errorHandler(new Error('I do not yet function'));
			// var content = $('#index').value + $('#transcript').value;
			// var data = new Blob(file, {type: 'text/xml'});
      //
	    // file = window.URL.createObjectURL(data);
      //
	    // return file;
			break;

		case "vtt":
			errorHandler(new Error('I do not yet function'));
			break;

		case "anno":
			errorHandler(new Error('I do not yet function'));
		  break;

		default:
			errorHandler(new Error('I do not yet function'));
			break;
	}
}

// Here we ensure the extension is usable by the system
function checkExt(ext) {
	var allowed = ["txt",
								 "vtt",
								 "xml",
								 "srt",
								 "mp4",
								 "webm",
								 "ogg",
								 "mp3"];

	if (allowed.indexOf(ext > -1)) return true;
	else return false;
}

// Here we determine what kind of file was uploaded
function determineFile(file, ext) {
	// List the information from the files
	console.group("File Name: " + file.name);
	console.log("File Size: " + parseInt(file.size / 1024, 10));
	console.log("File Type: " + file.type);
	console.log("Last Modified Date: " + new Date(file.lastModified));
	console.groupEnd();
    
	// List the information from the files
	var listItem = '<p class="list-item">';
	listItem += "File Name: " + file.name + "<br />";
	listItem += "File Size: " + parseInt(file.size / 1024, 10) + "kb<br />";
	listItem += "File Type: " + file.type + "<br />";
	listItem += "Last Modified Date: " + new Date(file.lastModified) + "<br />";
	listItem += "</p><hr />";
	document.getElementById('info-results').innerHTML += listItem;

	// We can't depend upon the file.type (Chrome, IE, and Safari break)
	// Based upon the extension of the file, display its contents in specific locations
	switch(ext) {
		case "txt":
		case "vtt":
		case "xml":
		case "srt":
			renderText(file, ext);
			break;

		case "mp4":
		case "webm":
			renderVideo(file);
			break;

		case "ogg":
		case "mp3":
			renderAudio(file);
			break;

		default:
			errorHandler(new Error("Bad File - cannot display data."));
			break;
	}

	// // Depending on the type of file, display its contents in specific players or locations
	// if (file.type.match('video.*')) renderVideo(file);
	// else if (file.type.match('audio.*')) renderAudio(file);
	// else if (file.type.match('text.*')) renderText(file, ext);
  //
	// // For legacy SRT files
	// else if (ext == "srt") renderText(file, ext);
  //
	// // If no file types or extensions are caught, clearly there's something wrong
	// else errorHandler(new Error("Bad File - cannot display data."));
}

// Here we empty the text areas
function reload() {
	if (confirm("This will start a new project and reload the page.") == true) {
        location.reload(true); 
	}
}

// Here we empty the text areas
function clearBoxes() {
	if (confirm("This will clear the URL, index, and transcript areas.") == true) {
        $("#index").val("");
  	    $("#transcript").val("");
		$("#media-url-upload").val("");
		$("#url-upload").val("");
		$("#errorBar").hide();
        $("#language").empty();
        $("#info-results").empty();

	}
}


function uploadFile(sender) {
	// Grab the files from the user's selection
	var input = document.getElementById(sender);
	for (var i = 0; i < input.files.length; i++) {
		var file = input.files[i];

		// Get file extension
		var name = file.name.split('.');
		var ext = name[name.length - 1].toLowerCase();

		if (checkExt(ext)) determineFile(file, ext);
		else errorHandler(new Error("Bad File - cannot load data from " + file.name));
	}
}

// This function is no longer utilized for non-AV files
function uploadURLFile(sender) {
	// Copy the URL to the user's clipboard, in case we need it later during an error
	// document.getElementById(sender).select();
	// document.execCommand("Copy");

	// Continue onward, grab the URL value
	var input = document.getElementById(sender);
	var url = input.value;

	// Get file extension from url
	var urlArr = url.split('.');
	var ext = urlArr[urlArr.length - 1];

	// We only allow local uploads of media files, not any text files
	if (ext == "txt" || ext == "vtt" || ext == "xml" || ext == "srt") {
		var error = new Error("This field only accepts audio and video file URLs.");
		errorHandler(error);
	}
	else {
		fetch(url)
			.then(res => res.blob())
			.then(blob => {
				if (checkExt(ext)) determineFile(blob, ext);
				else errorHandler(new Error("Bad File - cannot load data from " + url));
			})
			.catch(function(e) {
				// var error = new Error(e + "</p><p class='no-red'>Typically, this is due to a blocked Cross-Origin Request. We have copied your URL to your clipboard so that you may attempt to Browse Locally and paste the URL in the given prompt. This will allow the browser to attempt to download the file into your temporary files folder, and then upload it to the browser for editing or viewing.");
				errorHandler(e);
			});
	}
}

// Document Ready
(function($){
	// Don't show the video and audio controls
	$("#video").hide();
	$("#audio").hide();
	$("#errorBar").hide();

	// Here we hide items the user no longer wishes to see
	for (var close of document.querySelectorAll('.close')) {
	  close.addEventListener('click', function(){
			$(this).parent('div').fadeOut();
		}, false);
	}

  // For showing the export options
	$('#export').click(function(){
		$('#exportWrapper').toggleClass('open');
	});
}(jQuery));
