# Security policy

## Versions

The latest patches and the latest software are published under the `:main-<commit-short-hash>-<unix-timestamp>` tag scheme of the container image. The latest security updates are therefore published on such a tag first. A versioned container image (tag) is regularly available for productive use.

Older tags need to be updated manually, as we normally do not release an updated image for an existing tag; this is only done in case of _severe_ security vulnerabilities.

## Reporting a vulnerability

You can report a vulnerability or anomaly to the development team. This will initiate the process of coordinated vulnerability disclosure. The team will then endeavour to develop security patches within a week if possible. The vulnerability will then be publicised as part of the release. If you wish, you can also be published as a reporter.

* You can create a [security advisory in this repository](https://github.com/l3montree-dev/scanner-web-frontend/security/advisories/new).

* Alternatively, you can send an encrypted email to the following email address:

```text
-----BEGIN PGP SIGNED MESSAGE-----
Hash: SHA256

Contact: mailto:developer@l3montree.com
Expires: 2026-12-31T23:00:00.000Z
Encryption: https://l3montree.com/developer@l3montree.com-0xA71508222B6168D5-pub.asc
Preferred-Languages: en, de
Canonical: https://l3montree.com/.well-known/security.txt
-----BEGIN PGP SIGNATURE-----

iQJMBAEBCAA2FiEEg2Cvc8K1bPr9yFM3pxUIIithaNUFAmWz2RIYHGRldmVsb3Bl
ckBsM21vbnRyZWUuY29tAAoJEKcVCCIrYWjVFeIQALn6RPOJaUhnIG7i1woTq6fq
Xi1RrHwT6x0m0+RfERuYyOklUnx131VFrfa/axRri6v+gajFTcNrCEObZyjp2KTC
CvTGUKM26w1wbrz1pgmPc7NZV/M/XTzV+yr4Qhh237v0YxVRKkeKuUAJpeVJ8OPq
TcJoZrRRmIZ1stLk6IpNH/GBmcjcQRlOZQK+oIOlRVRR8j66Ko3M6hkCO3AUYw6e
bhjVJ4WbaWSVhT853QAsgZy9hhI8Ug9aeR5/ytC5C1ZWu6D/MiURJLYfRLS9OeKQ
Za3Jm1R/1iizNfQ4bMke/+zbAe2Qy5D53r+hMX/hOkBrbmzDtxqYBaEkRMy9bTcY
18O+81/tqhEfVcfLnXnMuqFqL1v6SG3oH2mhn5GWzdE9ihKhSJiqK/apdmJccTa2
64Pwvbn96fNOxO5rVSJH+nRVedmGnkKRKkTKio/DNNy4JdUzM5HvYgc2BOxGHcSp
K1+JJPx+LwTZ0b+M5kpJ0OImPdziSYa6uLM30tZ97LapIM70KIJD9yKOLVykAo8J
di+uAwE2HG9DZx+2QR9qhypm6NZflVHXPfNdKSVleCb0H1iO4jRtAlwaiuqcoVuW
DZ3ISTStXalb96Xbf3A5cVY/IMqeXaTZ/hwcK3icNvokSVgG9EqhvLVSZmrt6XJb
2B2IVNof3KEgRt3kQsvg
=FPOy
-----END PGP SIGNATURE-----
```

*Text based on: [DMS](https://github.com/docker-mailserver/docker-mailserver/blob/master/SECURITY.md)*