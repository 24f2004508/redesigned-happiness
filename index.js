import express from "express";
import crypto from "crypto";

const app = express();
app.use(express.json());

const EMAIL = "24f2004508@ds.study.iitm.ac.in";

app.post("/mcp", (req, res) => {
  const body = req.body;

  // initialize
  if (body.method === "initialize") {
    return res.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: {
          name: "exam-server",
          version: "1.0.0"
        }
      }
    });
  }

  // notifications/initialized
  if (body.method === "notifications/initialized") {
    return res.status(204).end();
  }

  // tools/list
  if (body.method === "tools/list") {
    return res.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        tools: [
          {
            name: "solve_challenge",
            description: "Exam tool",
            inputSchema: {
              type: "object",
              properties: {}
            }
          }
        ]
      }
    });
  }

  // tools/call
  if (
    body.method === "tools/call" &&
    body.params.name === "solve_challenge"
  ) {
    const challenge = req.header("X-Exam-Challenge") || "";

    const answer = crypto
      .createHash("sha256")
      .update(`${challenge}:${EMAIL}`)
      .digest("hex")
      .slice(0, 16);

    return res.json({
      jsonrpc: "2.0",
      id: body.id,
      result: {
        content: [
          {
            type: "text",
            text: answer
          }
        ]
      }
    });
  }

  res.status(400).json({
    jsonrpc: "2.0",
    id: body.id ?? null,
    error: {
      code: -32601,
      message: "Method not found"
    }
  });
});

app.listen(process.env.PORT || 3000);
