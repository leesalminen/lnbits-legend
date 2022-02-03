import asyncio

from fastapi import APIRouter
from fastapi.staticfiles import StaticFiles

from lnbits.db import Database
from lnbits.helpers import template_renderer
from lnbits.tasks import catch_everything_and_restart

db = Database("ext_diagonalley")

diagonalley_static_files = [
    {
        "path": "/diagonalley/static",
        "app": StaticFiles(directory="lnbits/extensions/diagonalley/static"),
        "name": "diagonalley_static",
    }
]

diagonalley_ext: APIRouter = APIRouter(
    prefix="/diagonalley", tags=["diagonalley"]
    # "diagonalley", __name__, static_folder="static", template_folder="templates"
)

def diagonalley_renderer():
    return template_renderer(["lnbits/extensions/diagonalley/templates"])


from .tasks import wait_for_paid_invoices
from .views import *  # noqa
from .views_api import *  # noqa


def diagonalley_start():
    loop = asyncio.get_event_loop()
    loop.create_task(catch_everything_and_restart(wait_for_paid_invoices))
