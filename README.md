# Looker ASCII Hack #

This was a hack day project to use the Looker API to provide a text-based display of Looker Looks.

It uses `swagger-client` to access the API, and `figlet` and `gnuplot` to create ASCII displays.

To use it you need a Looker API endpoint, a API client ID, and and API secret. Like the Ruby
client, it can use a `.netrc` file to store the client ID and key. `login` is the ID, and `password` the
secret.

```
machine your-host.looker.com:19999
	login abcdefgh
	password 12345678
```

Alternately, you can set the environment variables `LOOKER_HOST`, `LOOKER_CLIENT`, and `LOOKER_SECRET`.

You then need to configure which looks to display. Single value ("banner"), table and line graphs ("graph")
are supported. Given the resolution of an ASCII display, the simpler your Look, the more likely it is
to be legible.

```
{
  "host": "your-host.looker.com:19999",
  "pages": [
    {
      "renderer": "file",
      "data": "./data/looker.txt"
    },
    {
      "lookId": 39,
      "renderer": "banner",
      "duration": 5
    },
    {
      "lookId": 42,
      "renderer": "graph",
      "duration": 5
    },
    {
      "lookId": 44,
      "renderer": "table",
      "duration": 5
    }
  ]
}
```
