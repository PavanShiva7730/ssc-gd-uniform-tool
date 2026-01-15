const API_TOKEN = "REPLICATE_API_KEY_HERE"; // ⚠️ move to proxy later
const MODEL_VERSION = "MODEL_VERSION_ID"; // your Replicate model version

const generateBtn = document.getElementById("generateBtn");
const photoInput = document.getElementById("photoInput");
const loader = document.getElementById("loader");
const resultImage = document.getElementById("resultImage");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.onclick = async () => {
  const file = photoInput.files[0];
  if (!file) {
    alert("Please upload a photo first");
    return;
  }

  loader.classList.remove("hidden");
  resultImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const base64Image = await toBase64(file);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: base64Image,
        prompt: `
        Indian male wearing sscgd_uniform.
        Preserve the original face exactly.
        Official SSC GD Constable uniform with cap, belt, badge.
        Ultra realistic.
        Studio lighting.
        Government ID style photograph.
        `,
        negative_prompt: "cartoon, anime, fake uniform, distorted face, blur"
      }
    })
  });

  const prediction = await response.json();

  // Polling until image is ready
  let status = prediction.status;
  let outputUrl = null;

  while (status !== "succeeded" && status !== "failed") {
    await new Promise(r => setTimeout(r, 3000));

    const poll = await fetch(prediction.urls.get, {
      headers: {
        "Authorization": `Token ${API_TOKEN}`
      }
    });

    const pollData = await poll.json();
    status = pollData.status;

    if (status === "succeeded") {
      outputUrl = pollData.output[0];
    }
  }

  loader.classList.add("hidden");

  if (outputUrl) {
    resultImage.src = outputUrl;
    resultImage.classList.remove("hidden");
    downloadBtn.href = outputUrl;
    downloadBtn.classList.remove("hidden");
  } else {
    alert("Image generation failed. Please try again.");
  }
};

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}
