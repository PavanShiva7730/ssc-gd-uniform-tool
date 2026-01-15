// 🔴 DO NOT hardcode real API key in GitHub
// Use environment variable OR proxy in production
const REPLICATE_API_TOKEN = "r8_80UOfRMZfb0mYXda2hVi5sAsdSNCsUw2wT5rG";

// SDXL model version (official)
const MODEL_VERSION =
  "2b017d7c5c4b4e8f9e8a7d15a9c1b5c0a3b5f5c9e5f2c3b7c8d6e9f1";

const generateBtn = document.getElementById("generateBtn");
const imageInput = document.getElementById("imageInput");
const loading = document.getElementById("loading");
const outputImage = document.getElementById("outputImage");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.onclick = async () => {
  const file = imageInput.files[0];
  if (!file) {
    alert("Please upload a photo");
    return;
  }

  loading.classList.remove("hidden");
  outputImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const base64Image = await toBase64(file);

  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      "Authorization": `Token ${REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: base64Image,
        prompt: `
Indian male wearing SSC GD Constable uniform.
Preserve original face.
Khaki uniform, belt, cap.
Photorealistic.
Studio lighting.
Official ID photo style.
        `,
        negative_prompt:
          "cartoon, anime, distorted face, extra fingers, blur, fake uniform"
      }
    })
  });

  const prediction = await response.json();

  let status = prediction.status;
  let imageUrl = null;

  while (status !== "succeeded" && status !== "failed") {
    await new Promise(r => setTimeout(r, 3000));

    const poll = await fetch(prediction.urls.get, {
      headers: {
        "Authorization": `Token ${REPLICATE_API_TOKEN}`
      }
    });

    const pollData = await poll.json();
    status = pollData.status;

    if (status === "succeeded") {
      imageUrl = pollData.output[0];
    }
  }

  loading.classList.add("hidden");

  if (imageUrl) {
    outputImage.src = imageUrl;
    outputImage.classList.remove("hidden");
    downloadBtn.href = imageUrl;
    downloadBtn.classList.remove("hidden");
  } else {
    alert("Image generation failed");
  }
};

function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
  });
}
