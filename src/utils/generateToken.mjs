import TOKEN_LENGTH from "../const/TOKEN_LENGTH";

export default function generateToken() {
  const random = new Array(TOKEN_LENGTH);
  for (let index = 0; index < TOKEN_LENGTH; index += 1) {
    random[index] = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"[Math.floor(Math.random() * 62)];
  }
  return random.join("");
}
