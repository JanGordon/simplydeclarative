lserv -p $1 & esbuild ./main.ts --bundle --watch --outfile="out.js" && fg