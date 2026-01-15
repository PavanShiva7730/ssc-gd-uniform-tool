// ✅ Your Cloudflare Worker URL
const WORKER_URL = "https://ssc-gd-worker.medeti-prasad.workers.dev/";

// ✅ Official SDXL model version from Replicate
const MODEL_VERSION =
  "2b017d7c5c4b4e8f9e8a7d15a9c1b5c0a3b5f5c9e5f2c3b7c8d6e9f1";

const generateBtn = document.getElementById("generateBtn");
const imageInput = document.getElementById("imageInput");
const loading = document.getElementById("loading");
const outputImage = document.getElementById("outputImage");
const downloadBtn = document.getElementById("downloadBtn");

generateBtn.onclick = async () => {
  if (!imageInput.files.length) {
    alert("Please upload a photo first");
    return;
  }

  loading.classList.remove("hidden");
  outputImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const base64Image = await toBase64(imageInput.files[0]);

  // 1️⃣ Create prediction via Worker
  const createRes = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: base64Image,
        prompt:
          "Indian male wearing khaki SSC GD Constable uniform, photorealistic, studio lighting, official portrait",
        negative_prompt:
          "cartoon, anime, fake uniform, distorted face, blur"
      }
    })
  });

  const prediction = await createRes.json();

  // 2️⃣ Poll prediction status
  let imageUrl = null;

  while (true) {
    await new Promise(r => setTimeout(r, 4000));

    const pollRes = await fetch(prediction.urls.get);
    const pollData = await pollRes.json();

    if (pollData.status === "succeeded") {
      imageUrl = pollData.output[0];
      break;
    }

    if (pollData.status === "failed") {
      break;
    }
  }

  loading.classList.add("hidden");

  if (!imageUrl) {
    alert("Image generation failed. Try again.");
    return;
  }

  outputImage.src = imageUrl;
  outputImage.classList.remove("hidden");
  downloadBtn.href = imageUrl;
  downloadBtn.classList.remove("hidden");
};

// Helper: convert image to base64
function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
