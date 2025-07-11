`git clone https://github.com/jayk2401/fireworks_model_playground.git`

`cd backend`

Create virtual env, I use conda

`conda create -n fireworks_env python=3.11`
`conda activate fireworks_env`
`pip install -r requirements.txt`

Set API KEY in environment:
`export FIREWORKS_API_KEY='<API_KEY>'`

Start backend server
`uvicorn main:app --reload`

In different terminal:
# start react frontend server
`cd frontend`
`npm install`
`npm run dev`


Potential Improvements:

Based on user's prompt and question/objective, suggest models based on performance and/or cost
Perhaps after user has entered prompt, we calculate and rank best models from highest to lowest,
according to user's objectives - performance and/or cost and/or time to process. 

Have the ability to have mulitple models generate responses for the same prompt
And show side by side answers in one UI view. 
