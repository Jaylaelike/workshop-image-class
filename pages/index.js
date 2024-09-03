import React, { useState, useEffect, useRef } from "react";
import WebCam from "react-webcam";
import { Button, CircularProgress, TextField, Box } from "@mui/material";
import styles from "../styles/Home.module.css";
import Metatags from "../components/Metatags";
//Our tensorflow library
let ml5;

//Teachable machine url after uploading your model
const modelURL = "https://teachablemachine.withgoogle.com/models/MJncjRZU1/";
let classifier;

export default function Home() {
  const [loading, setLoading] = useState(true);

  //React hook for accessing the DOM element
  const webcamRef = useRef(null);

  //Label to be predicted by our classifier
  const [label, setLabel] = useState("");
  const [score, setScore] = useState("");
  const [activedModel, setActivedModel] = useState(false);

  const [modelUrl, setModelUrl] = useState(
    "https://teachablemachine.withgoogle.com/models/MJncjRZU1/"
  );

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user",
  };

  //We're using asynchronous useEffect so we can wait for our classifier to be initialized before we attempt to use it
  useEffect(() => {
    ml5 = require("ml5"); //Workaround because of "window is not defined" error
    (async () => {
      classifier = await ml5.imageClassifier(modelUrl + "model.json");
      classifyVideo();
    })();
  }, [activedModel]);

  const classifyVideo = () => {
    try {
      loading && setLoading(false);
      //Get the classifications and pass it to callback function
      classifier.classify(webcamRef.current.video, gotResults);
    } catch (err) {
      console.log(err.message);
    }
  };

  const gotResults = async (error, results) => {
    const label = results[0].label; //Predicted label with highest confidence
    setLabel(label);
    setScore(results[0].confidence.toFixed(3));
    classifyVideo(); // Run on next webcam image
    console.log(results[0]);
  };

  return (
    <div className={styles.main}>
      <Metatags />
      {loading ? (
        <CircularProgress style={{ marginTop: 200 }} />
      ) : (
        <>
          <WebCam
            audio={false}
            height={480}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={720}
            videoConstraints={videoConstraints}
          />

          <Box
            component="form"
            sx={{ "& > :not(style)": { m: 1, width: "25ch" } }}
            noValidate
            autoComplete="off"
          >
            <TextField
              id="outlined-basic"
              label="Model URL"
              variant="outlined"
              width={100}
              type="text"
              value={modelUrl}
              onChange={(e) => setModelUrl(e.target.value)}
              required={true}
            />

            <Button
              style={{ marginLeft: 10 }}
              color="success"
              variant="contained"
              onClick={() => {
                if (!modelUrl) {
                  alert("Please provide a valid model URL.");
                } else {
                  setActivedModel(!activedModel);
                }
              }}
            >
              Submit Model
            </Button>
          </Box>

          {modelUrl ? (
            <>
              <b style={{ fontSize: 50 }}>{"นี้คือ: " + label}</b>
              <b style={{ fontSize: 50 }}>{"ความเชื่อมั้น: " + score}</b>
            </>
          ) : (
            <p>Please provide a valid model URL.</p>
          )}
        </>
      )}
    </div>
  );
}
