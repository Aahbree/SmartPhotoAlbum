var name = '';
var encoded = null;
var fileExt = null;
window.SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
const synth = window.speechSynthesis;
const recognition = new SpeechRecognition();
const icon = document.querySelector('i.fa.fa-microphone')

function searchFromVoice() {
  console.log("i am here 1")
  recognition.start();
  console.log("i am here 2")
  recognition.onresult = (event) => {
    const speechToText = event.results[0][0].transcript;
    console.log(speechToText)
    console.log("i am here 3")

    var apigClient = apigClientFactory.newClient({
    apiKey: 'zsQWew9kiv4BnxIzs48uX6037wOow0eo8WKgsco2'
  });

  var body = {};
  var params = {
    q: speechToText,
    'x-api-key': 'zsQWew9kiv4BnxIzs48uX6037wOow0eo8WKgsco2',
	'Access-Control-Allow-Origin': '*',
  };
  var additionalParams = {
    headers: {
      'Content-Type': "application/json",
    },
  };

  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      //This is where you would put a success callback
      response_data = result.data
      //var img1 = result.data.body;
	  console.log(response_data);
      length_of_response = response_data.length;
      if (length_of_response == 0) {
        document.getElementById("displaytext").innerHTML = "No Images Found !!!"
        document.getElementById("displaytext").style.display = "block";
      }

      response_data.forEach(function (obj) {
        var img = new Image();
        // img.src = "https://photosforsearch1.s3.amazonaws.com/"+obj;
        img.src = obj;
        img.setAttribute("class", "banner-img");
        img.setAttribute("alt", "effy");
        img.setAttribute("width", "150");
        img.setAttribute("height", "100");
        document.getElementById("displaytext").innerHTML = "Images returned are : "
        document.getElementById("img-container").appendChild(img);
        document.getElementById("displaytext").style.display = "block";

      });
    }).catch(function (result) {
      //This is where you would put an error callback
    });
    // console.log(speechToText);
  }//
}


document.getElementById("displaytext").style.display = "none";

function searchPhoto() {

  var apigClient = apigClientFactory.newClient({
    apiKey: 'zsQWew9kiv4BnxIzs48uX6037wOow0eo8WKgsco2'
  });

  var image_message = document.getElementById("note-textarea").value; 
  console.log(image_message);

  var body = {};
  var params = {
    q: image_message,
    'x-api-key': 'zsQWew9kiv4BnxIzs48uX6037wOow0eo8WKgsco2',
	'Access-Control-Allow-Origin': '*',
  };
  var additionalParams = {
    headers: {
      'Content-Type': "application/json",
    },
  };

  apigClient.searchGet(params, body, additionalParams)
    .then(function (result) {
      //This is where you would put a success callback
      response_data = result.data
      //var img1 = result.data.body;
	  console.log(response_data);
      length_of_response = response_data.length;
      if (length_of_response == 0) {
        document.getElementById("displaytext").innerHTML = "No Images Found !!!"
        document.getElementById("displaytext").style.display = "block";
      }

      //img1 = response_data.replace(/\"/g, "").replace("[", "").replace("]", "");
      //img1 = img1.split(",");

      //document.getElementById("img-container").innerHTML = "";
      //var para = document.createElement("p");
      //para.setAttribute("id", "displaytext")
      //document.getElementById("img-container").appendChild(para);
      

      response_data.forEach(function (obj) {
        var img = new Image();
        // img.src = "https://photosforsearch1.s3.amazonaws.com/"+obj;
        img.src = obj;
        img.setAttribute("class", "banner-img");
        img.setAttribute("alt", "effy");
        img.setAttribute("width", "150");
        img.setAttribute("height", "100");
        document.getElementById("displaytext").innerHTML = "Images returned are : "
        document.getElementById("img-container").appendChild(img);
        document.getElementById("displaytext").style.display = "block";

      });
    }).catch(function (result) {
      //This is where you would put an error callback
    });

}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    // reader.onload = () => resolve(reader.result)
    reader.onload = () => {
      let encoded = reader.result.replace(/^data:(.*;base64,)?/, '');
      if ((encoded.length % 4) > 0) {
        encoded += '='.repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = error => reject(error);
  });
}

function uploadPhoto() {
  // var file_data = $("#file_path").prop("files")[0];
  var file = document.getElementById('file_path').files[0];
  const reader = new FileReader();
  if (!document.getElementById('custom_labels').innerText == "") {
    var customLabels = document.getElementById('custom_labels');
  }
  console.log(file)
  console.log(custom_labels.value);
  var cl= custom_labels.value;
  var file_data;
  // var file = document.querySelector('#file_path > input[type="file"]').files[0];
  var encoded_image = getBase64(file).then(
    data => {
      console.log(data)
      var apigClient = apigClientFactory.newClient({
        apiKey: "AUOuNErBtJ3wsgBmv9L889kByOl5vsux8o4Ng5cM",
		defaultContentType: "image/jpeg",
        defaultAcceptType: "image/jpeg",
      });

      // var data = document.getElementById('file_path').value;
      // var x = data.split("\\")
      // var filename = x[x.length-1]
      //var file_type = file.type + ";base64"

      // var body = data;
      var body = data;
      var params = {
        "key": file.name,
        "bucket": "putphotos",
        'x-api-key': 'AUOuNErBtJ3wsgBmv9L889kByOl5vsux8o4Ng5cM',
		"Content-Type" : "image/jpeg",
		'x-amz-meta-customLabels': cl
      };

      var additionalParams = {
      };

      // apigClient.uploadFolderItemPut(params, body, additionalParams).then(function (res) {
      //   if (res.status == 200) {
      //     // alert("Upload Successfull")
      //     console.log("Success");
      //     document.getElementById("uploadText").innerHTML = "IMAGE UPLOADED SUCCESSFULLY !!!"
      //     document.getElementById("uploadText").style.display = "block";
      //     document.getElementById("uploadText").style.color = "green";
      //     document.getElementById("uploadText").style.fontWeight = "bold";
      //   }
      // })
	  apigClient.uploadBucketKeyPut(params, body, additionalParams)
	  .then(function (result) {
		  console.log(result)
		  console.log('success OK');
		  console.log(result.data);
      document.getElementById("uploadText").innerHTML = "IMAGE UPLOADED SUCCESSFULLY !!!"
		  }).catch(function (result) {
			  console.log(result);
			  })
	});
}
