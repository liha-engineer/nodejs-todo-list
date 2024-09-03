export default (err, req, res, next) => {
  console.error(err);

  // joi에서 발생한 에러인 경우 ValidationError 라는 이름이 있으므로 400번으로 돌려준다
  if (err.name === "ValidationError") {
    return res.status(400).json({ errorMessage: err.message });
  }

  return res.status(500).json({ errorMessage: "서버에서 에러가 발생했습니다" });
};
