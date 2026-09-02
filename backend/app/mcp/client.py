import sys
import os
from typing import Dict, Any
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

PYTHON_EXEC = sys.executable

async def execute_mcp_tool(tool_name: str, arguments: Dict[str, Any]) -> str:
    """Executes a tool on the local MCP server via stdio."""
    try:
        # Determine the backend root directory to add to PYTHONPATH
        # This ensures 'app.mcp.run_server' can be found when executed as a module
        backend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
        
        env = os.environ.copy()
        env["PYTHONPATH"] = f"{backend_dir};{env.get('PYTHONPATH', '')}"

        server_params = StdioServerParameters(
            command=PYTHON_EXEC,
            args=["-m", "app.mcp.run_server"],
            env=env
        )
        
        async with stdio_client(server_params) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()
                result = await session.call_tool(tool_name, arguments=arguments)
                if result.isError:
                    return f"MCP Tool Error: {result.content}"
                
                text_content = ""
                for content in result.content:
                    if content.type == "text":
                        text_content += content.text
                return text_content
    except Exception as e:
        return f"Error communicating with MCP server: {str(e)}"
