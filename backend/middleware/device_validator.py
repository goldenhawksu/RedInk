"""
设备验证中间件
在API调用前验证设备绑定状态
"""

import logging
from functools import wraps
from flask import request, jsonify
from pathlib import Path
from backend.utils.device_binding import DeviceBinding

logger = logging.getLogger(__name__)

# 初始化设备绑定管理器
PROJECT_ROOT = Path(__file__).parent.parent.parent
TEXT_BINDING_MANAGER = DeviceBinding(PROJECT_ROOT / 'text_providers.yaml')
IMAGE_BINDING_MANAGER = DeviceBinding(PROJECT_ROOT / 'image_providers.yaml')


def require_device_binding(validate_text=True, validate_image=False):
    """
    设备绑定验证装饰器

    Args:
        validate_text: 是否验证文本服务的设备绑定
        validate_image: 是否验证图片服务的设备绑定

    Usage:
        @require_device_binding()  # 默认验证文本服务
        def my_route():
            pass

        @require_device_binding(validate_image=True)  # 验证图片服务
        def generate_images():
            pass

        @require_device_binding(validate_text=True, validate_image=True)  # 两者都验证
        def my_route():
            pass
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # 1. 从请求头获取设备ID
            device_id = request.headers.get('X-Device-ID')

            if not device_id:
                logger.warning("⚠️ 请求缺少设备ID")
                return jsonify({
                    "success": False,
                    "error": "设备验证失败: 缺少设备标识\n请确保使用最新版本的前端应用"
                }), 403

            # 2. 重新加载配置(确保使用最新的绑定信息)
            TEXT_BINDING_MANAGER.config = TEXT_BINDING_MANAGER._load_config()
            IMAGE_BINDING_MANAGER.config = IMAGE_BINDING_MANAGER._load_config()

            # 3. 验证文本服务
            if validate_text:
                active_provider = TEXT_BINDING_MANAGER.config.get('active_provider', 'default')
                valid, message = TEXT_BINDING_MANAGER.validate_device(active_provider, device_id)

                if not valid:
                    logger.error(f"❌ 文本服务设备验证失败: {message}")
                    return jsonify({
                        "success": False,
                        "error": f"设备验证失败: {message}\n\n💡 解决方法:\n1. 在'设置'页面重新配置API Key以绑定当前设备\n2. 设备绑定有效期为24小时,过期后需重新绑定"
                    }), 403

                logger.info(f"✅ 文本服务设备验证通过: {device_id[:8]}...")

            # 4. 验证图片服务
            if validate_image:
                active_provider = IMAGE_BINDING_MANAGER.config.get('active_provider', 'default')
                valid, message = IMAGE_BINDING_MANAGER.validate_device(active_provider, device_id)

                if not valid:
                    logger.error(f"❌ 图片服务设备验证失败: {message}")
                    return jsonify({
                        "success": False,
                        "error": f"设备验证失败: {message}\n\n💡 解决方法:\n1. 在'设置'页面重新配置API Key以绑定当前设备\n2. 设备绑定有效期为24小时,过期后需重新绑定"
                    }), 403

                logger.info(f"✅ 图片服务设备验证通过: {device_id[:8]}...")

            # 5. 验证通过,继续执行
            return f(*args, **kwargs)

        return decorated_function
    return decorator


def get_text_binding_manager() -> DeviceBinding:
    """获取文本服务的设备绑定管理器"""
    return TEXT_BINDING_MANAGER


def get_image_binding_manager() -> DeviceBinding:
    """获取图片服务的设备绑定管理器"""
    return IMAGE_BINDING_MANAGER
