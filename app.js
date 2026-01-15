const fileInput = document.getElementById("photoInput");
const generateBtn = document.getElementById("generateBtn");
const resultImage = document.getElementById("resultImage");
const loader = document.getElementById("loader");
const downloadBtn = document.getElementById("downloadBtn");

// ✅ Your Worker URL
const WORKER_URL = "https://ssc-gd.medeti-prasad.workers.dev";

generateBtn.addEventListener("click", async () => {
  if (!fileInput.files.length) {
    alert("Please upload a photo first");
    return;
  }

  loader.classList.remove("hidden");
  resultImage.classList.add("hidden");
  downloadBtn.classList.add("hidden");

  const reader = new FileReader();

  reader.onload = async () => {
    try {
      // 🔹 STEP 1: Create prediction
      const createRes = await fetch(WORKER_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: reader.result,
          prompt:
            "Ultra realistic portrait photo of an Indian SSC GD Constable wearing official khaki uniform, realistic lighting, sharp focus, professional photography, high detail face"
        })
      });

      const prediction = await createRes.json();

      if (!prediction.id) {
        loader.classList.add("hidden");
        console.error("Prediction error:", prediction);
        alert("Failed to start image generation");
        return;
      }

      // 🔹 STEP 2: Poll for result
      const poll = async () => {
        const pollRes = await fetch(`${WORKER_URL}?id=${prediction.id}`);
        const data = await pollRes.json();

        if (data.status === "succeeded") {
          loader.classList.add("hidden");

          resultImage.src = data.output[0];
          resultImage.classList.remove("hidden");

          downloadBtn.href = data.output[0];
          downloadBtn.classList.remove("hidden");
        } else if (data.status === "failed") {
          loader.classList.add("hidden");
          alert("Image generation failed");
        } else {
          setTimeout(poll, 4000);
        }
      };

      poll();
    } catch (err) {
      console.error(err);
      loader.classList.add("hidden");
      alert("Something went wrong");
    }
  };

  reader.readAsDataURL(fileInput.files[0]);
});
