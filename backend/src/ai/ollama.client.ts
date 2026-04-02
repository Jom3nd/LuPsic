import axios from "axios";

export async function chamarOllama(model: string, prompt: string) {
    const response = await axios.post("http://localhost:11434/api/generate", {
        model: model,
        prompt: prompt,
        stream: false,
        options: {
            num_predict: 200
        }
    });

    return response.data.response;
}