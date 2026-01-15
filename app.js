const WORKER_URL = "https://ssc-gd-worker.medeti-prasad.workers.dev/";

const MODEL_VERSION =
  "2b017d7c5c4b4e8f9e8a7d15a9c1b5c0a3b5f5c9e5f2c3b7c8d6e9f1";

const btn = document.getElementById("generateBtn");
const input = document.getElementById("imageInput");
const loading = document.getElementById("loading");
const img = document.getElementById("outputImage");
const download = document.getElementById("downloadBtn");

btn.onclick = async () => {
  if (!input.files.length) {
    alert("Upload image first");
    return;
  }

  loading.classList.remove("hidden");
  img.classList.add("hidden");
  download.classList.add("hidden");

  const base64 = await toBase64(input.files[0]);

  // 1️⃣ Create prediction
  const createRes = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      version: MODEL_VERSION,
      input: {
        image: base64,
        prompt:
          "Indian male wearing khaki SSC GD Constable uniform, photorealistic, studio lighting, official portrait",
        negative_prompt:
          "cartoon, anime, distorted face, blur, fake uniform"
      }
    })
  });

  const prediction = await createRes.json();

  // 2️⃣ Poll via Worker (IMPORTANT FIX)
  let imageUrl = null;

  while (true) {
    await new Promise(r => setTimeout(r, 4000));

    const pollRes = await fetch(
      `${WORKER_URL}?poll=${encodeURIComponent(prediction.urls.get)}`
    );

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
    alert("Image generation failed");
    return;
  }

  img.src = imageUrl;
  img.classList.remove("hidden");
  download.href = imageUrl;
  download.classList.remove("hidden");
};

function toBase64(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
