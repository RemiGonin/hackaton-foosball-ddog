const NB_POINT = 30;

export const getFakeSpeeds = () => {
  const res = [];
  for (let i = 0; i < NB_POINT; i++) {
    res[i] = 100 * Math.random();
  }

  return res;
};

export const getFakeLabels = () => {
  let date = new Date().getTime();
  const res = [];

  for (let i = 0; i < NB_POINT; i++) {
    let timestamp = date;
    res[i] = timestamp;
    date = date + 1000;
  }

  return res;
};
