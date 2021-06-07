import responseObjectClass from '../helpers/responseObjectClass';

const newResponseObject = new responseObjectClass();

async function checkConnection(req, res) {
  const returnObj = newResponseObject.create({
    code: 200,
    success: true,
    message: "Service's health is in working state :)",
  });
  res.send(returnObj);
}

export default {
  checkConnection,
};
