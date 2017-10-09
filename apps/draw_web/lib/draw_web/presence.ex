defmodule DrawWeb.Presence do
  use Phoenix.Presence, otp_app: :draw_web,
                        pubsub_server: DrawWeb.PubSub
end
