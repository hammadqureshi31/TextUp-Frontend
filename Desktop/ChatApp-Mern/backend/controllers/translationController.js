import axios from 'axios';


export async function handleTranslateMsgs(req, res){
    const { text, to } = req.body;
    console.log(text, to);
    try {
      const response = await axios.post(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}`,
        [{ Text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': process.env.API_KEY_TRANSLATION,
            'Ocp-Apim-Subscription-Region': process.env.REGION,
            'Content-Type': 'application/json',
          },
        }
      );
      res.json(response.data);
    } catch (err) {
      console.error(err);
      res.status(500).send('Translation error');
    }
}