# Assets de terceros — Dashboard Icons

Los archivos `.svg` de esta carpeta provienen de
[homarr-labs/dashboard-icons](https://github.com/homarr-labs/dashboard-icons),
publicado bajo **Apache License 2.0** (copia del texto en
`LICENSE-dashboard-icons`; Copyright (c) 2024 Bjorn Lammers, Meier Lukas,
Thomas Camlong y Homarr Labs).

Se copiaron **sin modificar**, de `main` @ `cf87d9bbd47792b20893f090ff48763fe874b05d`
(2026-09-21):

| Archivo               | Origen en el repo         | Autor del ícono (meta) |
| --------------------- | ------------------------- | ---------------------- |
| `disney-plus.svg`     | `svg/disney-plus.svg`     | wwwescape              |
| `prime-video-alt.svg` | `svg/prime-video-alt.svg` | jdcool00               |
| `chatgpt.svg`         | `svg/chatgpt.svg`         | Meierschlumpf          |

La licencia cubre el trabajo del repo, **no** concede derechos sobre las marcas
representadas: Disney+, Prime Video y ChatGPT/OpenAI son marcas de sus
respectivos dueños y aquí se usan solo para identificar el servicio dentro del
panel (mismo criterio que el set de Simple Icons de `service-icons.data.ts`).
Nota: Simple Icons no tiene (ni tuvo) ícono de OpenAI/ChatGPT, de ahí que salga
de este set en vez del bundle CC0.

`angular.json` publica solo los `*.svg` de esta carpeta en `/service-icons/`.
