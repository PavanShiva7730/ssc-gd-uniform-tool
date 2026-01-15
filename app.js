const fileInput = document.getElementById("photoInput");
const generateBtn = document.getElementById("generateBtn");
const resultImage = document.getElementById("resultImage");
const loader = document.getElementById("loader");

const WORKER_URL = "https://ssc-gd.medeti-prasad.workers.dev";

generateBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a photo");
    return;
  }

  loader.classList.remove("hidden");

  const reader = new FileReader();
  reader.onload = async () => {
    const base64Image = reader.result;

    const res = await fetch(WORKER_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        prompt: "Indian SSC GD Constable wearing uniform, realistic photo"
      })
    });

    const data = await res.json();

    loader.classList.add("hidden");

    if (data.output && data.output[0]) {
      resultImage.src = data.output[0];
      resultImage.classList.remove("hidden");
    } else {
      alert("Image generation failed");
    }
  };

  reader.readAsDataURL(fileInput.files[0]);
});
