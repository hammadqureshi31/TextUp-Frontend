import axios from 'axios';

const apiKey = 'Ex9mfA5cNNF3tr4TrJZlUAbPnXM7EKpCeoc3PIVOPoY0EnM6CpxrJQQJ99BDACGhslBXJ3w3AAAbACOGk0pI';
const region = 'centralindia';

export async function handleTranslateMsgs(req, res){
    const { text, to } = req.body;
    console.log(text, to);
    try {
      const response = await axios.post(
        `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=${to}`,
        [{ Text: text }],
        {
          headers: {
            'Ocp-Apim-Subscription-Key': apiKey,
            'Ocp-Apim-Subscription-Region': region,
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