# paginator

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Lints and fixes files
```
npm run lint
```

## On Toolforge

Build the tool

```
webservice --backend=kubernetes node10 shell
cd ~/paginator
npm run build
```

Start the webserver

```
ln -s ~/paginator/dist ~/public_html
webservice --backend=kubernetes php7.4 start
```