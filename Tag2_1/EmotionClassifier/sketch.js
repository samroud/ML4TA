let mobileNet;
let classifier;

let video;

let classes = [ "Happy", "Surprised", "Neutral"]
let buttons = ["buttonHappy", "buttonSurprised", "buttonNeutral"]

let faceapi;

let detections = []

function setup() 
{
	can = createCanvas(640, 480);
    can.parent("#canvasDiv")

    video = createCapture(VIDEO)
    video.size(width, height)
    video.hide()

    const options = {numLabels : 3}
    mobileNet = ml5.featureExtractor("MobileNet", modelReady);
    classifier = mobileNet.classification(video, options)
    
    const detectionOptions = {
        withLandmarks: true,
        withDescriptors: false,
      };


   // Initialize the magicFeature
    faceapi = ml5.faceApi(video,detectionOptions, modelLoaded);
    
    initalizeButtons()
}



function draw()
{
 image(video, 0, 0);

 if(detections.length > 0){
     drawBox(detections)
 }
}

function modelReady(){
   select("#status").html("Model Loaded")
}

 
  // When the model is loaded
  function modelLoaded() {
    select("#status").html("FaceApi Model Loaded")
  
    // Make some sparkles
    faceapi.detect(detectFaces);
  }
  

  

function initalizeButtons() {

    for(let i = 0; i< classes.length; i++){
        let className = classes[i].toString()
        buttons[i] = select("#" + className);
        buttons[i].mousePressed( function() {
            classifier.addImage(className)
            var span = document.getElementById(className + "Images")
            var numImages = parseInt(span.innerHTML)
            numImages++
            span.innerHTML = numImages;

        })
    }

    train = select("#Train");
    train.mousePressed(function(){
        classifier.train(function(lossValue){
            if(lossValue){
                loss = lossValue;
                select("#loss").html(`Loss: ${loss} `);
            }else {
                select("#loss").html(`Finished , Final Loss: ${loss} `);
            }
        });
    });

    predict = select("#Predict")
    predict.mousePressed(classify)

    saveModel = select("#saveModel")
    saveModel.mousePressed( function(){
        classifier.save();
    })

    loadModel = select("#loadModel")
    loadModel.mousePressed(function(){
        select("#status").html("Loaded custom model")
    })

    loadModel.changed(function(){
       classifier.load(loadModel.elt.files);
    })
}

function classify() {

    classifier.classify(gotResult);
}

function gotResult(error, result){
    if(error){
        console.error(error)
    }
    if(result){
        select("#result").html(result[0].label);
        select("#confidence").html(`${result[0].confidence.toFixed(2) * 100}%`)
        classify();
    }

}

function detectFaces(error, result){
    if(error){
        console.error(error)
    }


    detections = result;
    faceapi.detect(detectFaces);
}

function drawBox(detections){

    for(let i = 0; i<detections.length; i++){
        let faceBox = detections[i].alignedRect;
        let x = faceBox._box._x;
        let y = faceBox._box._y;

        let boxW = faceBox._box._width;
        let boxH = faceBox._box._height;


        noFill();
        strokeWeight(5)
        stroke(0, 0,255)
        rect(x,y, boxW, boxH)
    }
}