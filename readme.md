# AnonChat

_Work in progress_

Chat annonymously with facebook friends.

<img width="584" height="520" src="https://cloud.githubusercontent.com/assets/5562241/19131141/d9feb75e-8b6b-11e6-932d-bb702de0c418.png" />



# Setup

__Requirements:__

- node
- redis

```
git clone git@github.com:jitendra-1217/FbAnonChat.git              -- Clones git repo
cd FbAnonChat                                                      -- Change to project directory
npm install                                                        -- Install npm dependencies
bower install                                                      -- Install bower dependencies
cp application/configs/env.sh.sample application/configs/env.sh    -- Create local env file
source application/configs/env.sh && nodemon app.js                -- Export env vars and start app
```
