
  // Convert image file to base64 data URI
  const fileToDataUri = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
});

export const predictImage = async (img: File) => {

    const devLink = 'https://kalandjl-leanai-api.hf.space/predict'
    const productionLink = "https://leanai.onrender.com/predict"
    if (!process.env.NEXT_PUBLIC_ENV) return

    try {
      const imgData = await fileToDataUri(img);
 
      const response = await fetch(devLink, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data_uri: imgData})
      })

      const json = await response.json();
      console.log(json)
      return json
    } catch (error) {
      alert("Error during prediction: " + error);
    } 
}