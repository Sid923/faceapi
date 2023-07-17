
//Loading the models
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
  faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
  faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
  faceapi.nets.faceExpressionNet.loadFromUri('/models')
]).then(startVideo)
  
  // Start video stream and detect faces
  function startVideo() {
    // Capture video from webcam
    const video = document.getElementById('video');
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        video.srcObject = stream;
      })
      .catch((error) => {
        console.error('Error accessing webcam:', error);
      });
  
    // Detect faces in real-time
    video.addEventListener('play', () => {
      const canvas = faceapi.createCanvasFromMedia(video);
      document.body.append(canvas);
      const displaySize = { width: video.width, height: video.height };
      faceapi.matchDimensions(canvas, displaySize);
  
      // Load mask image
      const maskImage = new Image();
      maskImage.src = 'mask.png';
      //console.log("HEllo1")
  
      // Wait for the image to load
      maskImage.onload = () => {
        // The image has loaded, so you can start using it
  
        setInterval(async () => {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
          const resizedDetections = faceapi.resizeResults(detections, displaySize);
  
          // Clear canvas
          canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
          //faceapi.draw.drawDetections(canvas, resizedDetections)
  
          // Apply mask filter for each detected face
          resizedDetections.forEach((detection) => {
            const { landmarks } = detection;
            const leftEye = landmarks.getLeftEye()[0];   // Example: Get the left eye position
            const rightEye = landmarks.getRightEye()[3]; // Example: Get the right eye position
  
            // Calculate mask position and size based on landmarks
            const maskWidth = 200;  // Adjust according to the mask's width
            const maskHeight = 100; // Adjust according to the mask's height
            const maskX = leftEye.x - (maskWidth / 2)+50;      // Adjust according to the mask's X position
            const maskY = leftEye.y - (maskHeight / 2)+90;     // Adjust according to the mask's Y position
  
            // Draw the mask on the canvas
            const ctx = canvas.getContext('2d');
            ctx.drawImage(maskImage, maskX, maskY, maskWidth, maskHeight);
            //console.log("HEllo2")
          });
        }, 100); // Adjust the interval based on your needs
      };
    });
  }
  