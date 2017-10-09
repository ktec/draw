defmodule DrawWeb.PageController do
  use DrawWeb, :controller
  alias DrawWeb.Session

  def index(conn, _params) do
    render conn, "index.html", %{token: Session.token(conn)}
  end
end
