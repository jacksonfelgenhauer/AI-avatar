import { useState, useEffect } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import buildspaceLogo from '../assets/buildspace-logo.png';

const Home = () => {
    // Don't retry more than 20 times
    const maxRetries = 20;
  const [retry, setRetry] = useState(0);
    // Number of retries left
  const [retryCount, setRetryCount] = useState(maxRetries);

  const [input, setInput] = useState('');
  const [img, setImg] = useState(''); 
  const [isGenerating, setIsGenerating] = useState(false);
  // Add new state here
const [finalPrompt, setFinalPrompt] = useState('');

  const onChange = (event) => {
    setInput(event.target.value);
  };
  const generateAction = async () => {
    console.log('Generating...');

  // Add this check to make sure there is no double click
  if (isGenerating && retry === 0) return;

  // Set loading has started
  setIsGenerating(true);
  
       // If this is a retry request, take away retryCount
       if (retry > 0) {
        setRetryCount((prevState) => {
          if (prevState === 0) {
            return 0;
          } else {
            return prevState - 1;
          }
        });
  
        setRetry(0);
      }

    const finalInput = input.replace(/aaron/gi, 'ooaarono');

    // Add the fetch request
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'image/jpeg',
      },
      body: JSON.stringify({ input: finalInput }),
    });
  
    const data = await response.json();

    // If model still loading, drop that retry time
    if (response.status === 503) {
      console.log('Model is loading still :(.')
      return;
    }
  
    // If another error, drop error
    if (!response.ok) {
      console.log(`Error: ${data.error}`);
          // Stop loading
    setIsGenerating(false);
      return;
    }

        // Set final prompt here
        setFinalPrompt(input);
        // Remove content from input box
        setInput('');

      // Set image data into state property
      setImg(data.image);
        // Everything is all done -- stop loading!
  setIsGenerating(false);
  };

    // Add useEffect here
    useEffect(() => {
      const runRetry = async () => {
        if (retryCount === 0) {
          console.log(`Model still loading after ${maxRetries} retries. Try request again in 5 minutes.`);
          setRetryCount(maxRetries);
          return;
          }
  
        console.log(`Trying again in ${retry} seconds.`);
  
        await sleep(retry * 1000);
  
        await generateAction();
      };
  
      if (retry === 0) {
        return;
      }
  
      runRetry();
    }, [retry]);

  return (
    <div className="root">
      <Head>
        <title>Aaron AI Picture Generator</title>
      </Head>
      <div className="container">
        <div className="header">
          <div className="header-title">
            <h1>Aaron AI picture generator</h1>
          </div>
          <div className="header-subtitle">
            <h2>Turn me into anyone you want! Make sure you refer to me as "aaron" in the prompt</h2>
          </div>
          <div className="prompt-container">
              <input className="prompt-box" value={input} onChange={onChange}/>
              <div className="prompt-buttons">
              <a
      className={
        isGenerating ? 'generate-button loading' : 'generate-button'
      }
      onClick={generateAction}>
              <div className="generate">
              {isGenerating ? (
          <span className="loader"></span>
        ) : (
                <p>Generate</p> 
        )}
              </div>
              </a>
              </div>
          </div>
        </div>
        {img && (
      <div className="output-content">
        <Image src={img} width={512} height={512} alt={input} />
        <p>{finalPrompt}</p>
      </div>
    )}
      </div>
      <div className="badge-container grow">
        <a
          href=""
          target="_blank"
          rel="noreferrer"
        >
          <div className="badge">
            <p></p>
          </div>
        </a>
      </div>
    </div>
  );
};

export default Home;
