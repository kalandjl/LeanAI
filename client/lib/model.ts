
  // Convert image file to base64 data URI
  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
});

export const predictImage = async (img: File) => {

    try {
      const imgData = await fileToDataUri(img);

      const response = await fetch(
        "http://0.0.0.0:8144/model/predict",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            data: [imgData],
          }),
        }
      );

      const json = await response.json();
      return json
    } catch (error) {
      alert("Error during prediction: " + error);
    } 
}