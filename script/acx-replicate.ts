import Replicate from 'replicate'

const replicate = new Replicate({ auth: process.env.REPLICATE_API_TOKEN })
const ACX_GIST =
  'https://gist.githubusercontent.com/akrolsmir/76ae74ef085222d6c99aaca48b00ccfc/raw/5d2fdf43948886ddeb5b1b1183b0beeedb11b7b1/acx-100.jsonl'
const VERSION =
  'meta/llama-2-7b:73001d654114dad81ec65da3b834e2f691af1e1526453189b7bf36fb3f32d0f9'
const TRAIN_ID = 'qztewzx4jxrgg0cgg3nacr238c'

async function trainModel() {
  const training = await replicate.trainings.create(
    'meta',
    'llama-2-7b',
    VERSION.split(':')[1],
    {
      destination: 'akrolsmir/llama2-acx',
      input: {
        train_data: ACX_GIST,
        num_train_epochs: 4,
        train_batch_size: 2,
      },
    }
  )

  let currentTraining = await replicate.trainings.get(training.id)
  while (
    currentTraining.status !== 'succeeded' &&
    currentTraining.status !== 'failed'
  ) {
    await new Promise((resolve) => setTimeout(resolve, 10000))
    currentTraining = await replicate.trainings.get(training.id)
    console.log('Status:', currentTraining.status)
  }

  console.log(
    training.status === 'succeeded' ? 'Success:' : 'Failed:',
    training.output || training.error
  )
}

trainModel()

/*
Training started: {
  id: "qztewzx4jxrgg0cgg3nacr238c",
  model: "meta/llama-2-7b",
  version: "73001d654114dad81ec65da3b834e2f691af1e1526453189b7bf36fb3f32d0f9",
  input: {
    num_train_epochs: 1,
    train_data: "https://gist.githubusercontent.com/akrolsmir/76ae74ef085222d6c99aaca48b00ccfc/raw/5d2fdf43948886ddeb5b1b1183b0beeedb11b7b1/acx-100.jsonl",
  },
  logs: "",
  output: null,
  data_removed: false,
  error: null,
  status: "starting",
  created_at: "2024-07-05T03:22:59.607Z",
  urls: {
    cancel: "https://api.replicate.com/v1/predictions/qztewzx4jxrgg0cgg3nacr238c/cancel",
    get: "https://api.replicate.com/v1/predictions/qztewzx4jxrgg0cgg3nacr238c",
  },
}
*/
