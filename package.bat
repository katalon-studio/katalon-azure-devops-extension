call cd katalonTask 
call npx babel src --out-dir build
call cd ..
call tfx extension create --manifest-globs vss-extension.json